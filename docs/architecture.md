# VoteSecure System Architecture & Security Protocol Specification

## 1. System Overview & Philosophy

**VoteSecure** is an enterprise-grade Online Voting Management System built on the MERN stack (MongoDB, Express.js, React.js, Node.js). It is engineered for educational institutions, collegiate elections, union representatives, and organizational governance bodies.

The core design mandate addresses three fundamental balloting axioms:
1. **Roster Integrity**: Zero public voter self-registration; voter accounts and credentials must be provisioned exclusively by authorized administrators.
2. **Secret Ballot Confidentiality**: The voter's identity must remain completely decoupled from their ballot choice, preventing any administrator or observer from linking a voter to their cast vote.
3. **Immutability & Concurrency Safety**: A voter may vote only once per position per election; duplicate attempts (including simultaneous race-condition requests) must be rejected deterministically by the database engine.

---

## 2. Multi-Tier High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER (React)                               |
|  [Vite + React Router DOM + Tailwind CSS + Recharts + Axios Interceptors]         |
|                                                                                   |
|  +---------------------------+             +------------------------------------+ |
|  |     VOTER INTERFACE       |             |        ADMINISTRATIVE CONSOLE      | |
|  |  • Clean Topbar Navbar    |             |  • Dark Slate Sidebar Navigation   | |
|  |  • Active Elections Grid  |             |  • System Stats & Analytics Charts | |
|  |  • 9-Step Voting Booth    |             |  • Voter Provisioning & Search     | |
|  |  • Review & Confirm Modal |             |  • Election & Post CRUD            | |
|  |  • Anonymous Token Receipt|             |  • Candidate Symbol Management     | |
|  |  • Participation History  |             |  • Result Policy & CSV Export      | |
|  +---------------------------+             +------------------------------------+ |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST
                                           v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & MIDDLEWARE                              |
|  [Express.js / Node.js Runtime]                                                   |
|  • Helmet.js Security Headers        • CORS Dynamic Origin Validation            |
|  • Express Rate Limiter (Brute-force) • Express Validator Payload Sanitization    |
|  • Multer Multipart Media Handler    • Centralized Error & Exception Handler      |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                          AUTHENTICATION & ROLE GUARDS                             |
|  • JWT Verification (Stateless Bearer Token, 24h Expiry)                          |
|  • isAdmin Guard: Ensures req.user.role === 'admin'                              |
|  • isVoter Guard: Ensures req.user.role === 'voter' AND voter.status === 'Active'|
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        BUSINESS LOGIC & CONTROLLER SERVICES                       |
|  • authController     • voterController       • electionController                |
|  • postController     • candidateController   • voteController (Atomic Ballot)    |
|  • resultController (Aggregation & CSV Report Engine)                             |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM / Driver
                                           v
+-----------------------------------------------------------------------------------+
|                                DATABASE ENGINE TIER                               |
|  [MongoDB Atlas / In-Memory MongoDB Engine]                                       |
|                                                                                   |
|  +---------------------------+             +------------------------------------+ |
|  |  AUDIT & PARTICIPATION    |             |       SECRET BALLOT VAULT          | |
|  |  Collection: participations|            |  Collection: votes                 | |
|  |  • voterId (Ref: Voter)   |             |  • electionId (Ref: Election)      | |
|  |  • electionId (Ref: Elec) |             |  • postId (Ref: Post)              | |
|  |  • postId (Ref: Post)     |             |  • candidateId (Ref: Candidate)    | |
|  |  • submittedAt: Date      |             |  • ballotToken: Unique Crypto UUID | |
|  |  UNIQUE COMPOUND INDEX:   |             |  NO voterId STORED (SECRET BALLOT) | |
|  |  {voterId, elecId, postId}|             |  Indexed: {elecId, postId, candId} | |
|  +---------------------------+             +------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 3. Cryptographic Secret Ballot Protocol

In naive voting systems, the vote record often contains `voterId` and `candidateId` together in the same row. This violates secret balloting, because any database administrator or query can easily see for whom each individual voted.

VoteSecure implements a **Decoupled Dual-Collection Architecture**:

### Collection 1: `participations`
Tracks *who* has exercised their franchise to prevent duplicate voting and provide turnout statistics:
```json
{
  "_id": "67cb1a4b9f1d2e001a2b3c4d",
  "voterId": "67cb19208e1a2b001c3d4e5f",
  "electionId": "67cb19a58e1a2b001c3d4e77",
  "postId": "67cb19cf8e1a2b001c3d4e88",
  "hasVoted": true,
  "submittedAt": "2026-11-06T16:22:45.120Z"
}
```
**Database Invariant**:
`db.participations.createIndex({ voterId: 1, electionId: 1, postId: 1 }, { unique: true })`

### Collection 2: `votes`
Stores the actual ballot choice completely anonymized:
```json
{
  "_id": "67cb1a4b9f1d2e001a2b3c4e",
  "electionId": "67cb19a58e1a2b001c3d4e77",
  "postId": "67cb19cf8e1a2b001c3d4e88",
  "candidateId": "67cb1a108e1a2b001c3d4e99",
  "ballotToken": "BALLOT-9F2B48D1E64C091A77E28B33D810FA22",
  "createdAt": "2026-11-06T16:22:45.122Z"
}
```

### Properties of this Protocol:
1. **Auditability**: Administrators can verify that voter `VOTER202601` voted for the post of *President*.
2. **Confidentiality**: Neither the admin nor anyone inspecting the database can determine *which* candidate `VOTER202601` chose.
3. **Receipt Verification**: The voter is given the anonymous `ballotToken` as proof of successful voting without revealing their choice.
4. **Duplicate Prevention**: If the voter attempts to vote again for the same position, the compound index on `participations` rejects the write immediately with code 11000 duplicate key error.

---

## 4. Concurrency & Race-Condition Safeguards

When voters submit votes simultaneously (or click the submit button rapidly), application-level checks like `if (hasVoted)` can suffer from Time-of-Check to Time-of-Use (TOCTOU) race conditions.

VoteSecure addresses this through a multi-tier defense:
1. **Client-side debouncing**: The React voting button disables immediately upon submission (`submittingVote: true`), showing an active loading spinner.
2. **Pre-flight check**: The backend queries `Participation.findOne({ voterId, electionId, postId })`.
3. **Atomic Database Insertion with Unique Index**: The `Participation` record is created before the ballot is inserted. If a concurrent thread bypassed the check, MongoDB's atomic index lock catches the collision and raises `MongoServerError: E11000 duplicate key error collection`.
4. **Error Interception**: The error handler translates code 11000 to HTTP 400 with message `"Duplicate submission blocked: You have already voted for this post."`

---

## 5. Security & Authentication Model

| Component | Implementation | Purpose |
|---|---|---|
| Password Hashing | `bcryptjs` (Salt Rounds = 10) | Prevents rainbow table and dictionary attacks |
| Token Format | `jsonwebtoken` (HMAC SHA-256) | Stateless authentication with 24h validity |
| Brute-Force Defense | `express-rate-limit` | Caps login attempts to 30 requests per 15 minutes per IP |
| HTTP Security Headers | `helmet` | Defends against XSS, clickjacking, MIME sniffing |
| CORS Origin Guard | `cors` with origin whitelisting | Prevents unauthorized cross-domain scripting |
| File Upload Sanitization | `multer` with MIME regex & 5MB cap | Defends against malicious executable uploads |
| Role Separation | Express middleware (`isAdmin`, `isVoter`) | Strictly isolates admin tools from voters |

---

## 6. Zero-Config Local Execution Fallback

To support immediate demonstration and evaluation without requiring external MongoDB Atlas network credentials, the backend includes an automated **In-Memory Database Fallback Engine**:
- When `MONGODB_URI` is unconfigured or unavailable, `server/config/db.js` initializes `mongodb-memory-server`.
- This spins up an isolated, in-process MongoDB engine on a loopback port.
- When `MONGODB_URI` is provided (e.g., in production or Atlas hosting), the connection seamlessly switches to MongoDB Atlas with SSL/TLS encryption.

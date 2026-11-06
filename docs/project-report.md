# VoteSecure – Online Voting Management System
## Full-Stack MERN Academic Project Technical Report

**Project Title:** VoteSecure – Online Voting Management System  
**Technology Stack:** MongoDB, Express.js, React.js, Node.js (MERN)  
**Academic Program:** MERN Stack Web Development Training Program  
**Submission Version:** 1.0.0 (Production-Ready)  

---

### Team Information
- **Team Name:** [Enter Unique Team Name]
- **Team Member 1:** [Enter Name] – [Registration Number]
- **Team Member 2:** [Enter Name] – [Registration Number]
- **Team Member 3:** [Enter Name] – [Registration Number]

---

## Executive Summary

**VoteSecure** is an enterprise-grade, secure, responsive full-stack online voting management system engineered on the genuine MERN stack. Designed specifically for academic institutions, collegiate unions, corporate governance, and community organizations, VoteSecure solves the systemic flaws of physical paper balloting and vulnerable generic web forms. 

Unlike consumer applications that feature public sign-ups, VoteSecure mandates **Zero Public Voter Self-Registration**. The election roll is strictly managed by an authorized administrator who provisions voter accounts with pre-hashed credentials. Furthermore, VoteSecure implements a **Decoupled Secret Balloting Protocol** that permanently separates a voter's participation record from their confidential ballot choice, ensuring absolute constitutional privacy while maintaining rigorous auditability and preventing duplicate voting through database engine-level unique constraints.

---

## 1. Introduction & Problem Statement

### 1.1 Context
Elections in universities and organizations form the bedrock of democratic representation. Historically, these elections have relied on manual paper balloting or ad-hoc digital spreadsheets. 

### 1.2 Problems with Existing Methods
1. **Physical Paper Ballots:** Extremely labor-intensive, vulnerable to physical ballot tampering, costly to print and distribute, and susceptible to counting errors during manual tabulation.
2. **Generic Online Polls:** Common survey tools or open-registration voting software allow any user to create multiple email accounts, leading to voter roll inflation and duplicate voting.
3. **Privacy Violations in Naive Software:** Many existing voting prototypes store the voter's identity and their selected candidate in the same database table, completely destroying voter anonymity and enabling intimidation or retaliatory actions by administrators.
4. **Race Conditions:** Under peak voting windows, concurrent HTTP requests from the same user often result in double or triple voting before server state updates.

### 1.3 The VoteSecure Vision
VoteSecure provides a robust, institutional-grade online balloting environment where voter roll integrity is preserved through manual admin provisioning, ballot choices remain strictly secret, and duplicate voting is mathematically prevented.

---

## 2. Project Objectives

1. **Role-Governed Portal Architecture:** Implement strict separation between Administrator and Voter roles with isolated routing, layouts, and API authentication.
2. **Admin-Controlled Voter Provisioning:** Empower administrators to manually create, search, filter, edit, activate/deactivate, and reset passwords for voters.
3. **Multi-Position Election Modeling:** Enable dynamic elections containing multiple contested positions (e.g., President, Vice-President, Secretary) with individual candidate rosters.
4. **Candidate Graphics & Symbols:** Support candidate portrait photos and official ballot symbols to ensure high clarity for voters.
5. **Secret Balloting Architecture:** Decouple participation audits from anonymous ballot tokens to guarantee that no one (including administrators) can correlate a voter to their choice.
6. **Concurrency & Anti-Duplicate Protection:** Enforce compound unique indexing `{ voterId: 1, electionId: 1, postId: 1 }` in MongoDB to prevent double voting.
7. **Comprehensive Analytics & CSV Reporting:** Deliver instant tallies, Recharts bar and pie visualizations, turnout rates, winner declarations, and downloadable CSV audit files.

---

## 3. Technology Stack & Architectural Justification

| Technology | Layer | Justification |
|---|---|---|
| **MongoDB Atlas** | Database | Flexible document schema, compound indexing, atomic transactions, aggregation framework |
| **Express.js** | Backend Framework | High-performance routing, robust middleware chaining (Helmet, CORS, Rate Limit) |
| **React.js (Vite)** | Frontend Client | Virtual DOM, declarative component state, fast Vite HMR, single-page application speed |
| **Node.js** | Runtime | Asynchronous event loop, high concurrent I/O throughput, zero-config test automation |
| **Tailwind CSS** | Styling System | Utility-first responsive styling, institutional color palette, accessible interactive states |
| **JSON Web Token** | Authentication | Stateless, tamper-evident cryptographic bearer tokens with role claims |
| **bcryptjs** | Password Security | Adaptive cryptographic one-way hashing with salt rounds = 10 |
| **Recharts** | Data Visualization | Declarative SVG bar and pie charts for real-time election result analysis |
| **Multer** | Media Processing | Multipart stream parsing for candidate portraits and ballot symbols with size/type validation |

---

## 4. System Architecture & Workflows

### 4.1 Tiered Architectural Diagram
```
Client Tier (React Vite SPA)
       │  (HTTPS JSON REST / JWT Bearer)
       ▼
API Gateway & Security Middleware (Helmet, CORS, Rate Limiter)
       │
       ▼
Role-Based Authorization (isAdmin / isVoter Guards)
       │
       ▼
Service & Controller Logic (Auth, Voter, Election, Post, Candidate, Vote, Results)
       │
       ▼
Database Engine (MongoDB Atlas with Compound Unique Constraints)
```

### 4.2 9-Step Voter Balloting Workflow
1. **Authentication:** Voter logs in via `/voter/login` using their admin-issued User ID and password.
2. **Poll Selection:** Voter accesses the Voter Dashboard and reviews active elections.
3. **Booth Entry:** Voter opens the active election's secure balloting booth.
4. **Position Navigation:** Voter selects a contested post (e.g., *President*).
5. **Candidate Review:** Candidate cards display official portrait photo, name, candidate ID, symbol graphic, and manifesto.
6. **Selection:** Voter clicks "Vote for [Candidate]".
7. **Confirmation Review:** A modal dialog warns the voter that the ballot is irreversible and prompts for final confirmation.
8. **Atomic Commit:** The backend records participation in `participations` and an anonymous vote in `votes`.
9. **Ballot Receipt:** A confirmation receipt displays an anonymous cryptographic `ballotToken` with celebratory confetti.

---

## 5. Database Design & Data Models

### 5.1 Entity-Relationship Overview
- **Admin**: System operators with complete governance control.
- **Voter**: Eligible electors manually enrolled by administrators.
- **Election**: Event container defining voting dates, daily windows, and status.
- **Post**: Contested office within an election (e.g., *Treasurer*).
- **Candidate**: Nominee contesting for a specific post in an election.
- **Participation**: Audit record linking voter to election and post (`voterId`, `electionId`, `postId`).
- **Vote**: Anonymous ballot choice containing only `electionId`, `postId`, `candidateId`, and `ballotToken`.

### 5.2 Compound Index Invariants
```javascript
// Enforces that a voter can never vote twice for the same post in an election:
participationSchema.index({ voterId: 1, electionId: 1, postId: 1 }, { unique: true });

// Optimizes rapid result tallying without scanning the entire database:
voteSchema.index({ electionId: 1, postId: 1, candidateId: 1 });
```

---

## 6. REST API Specification

### Authentication
- `POST /api/auth/admin/login` – Authenticates administrator credentials; returns JWT token.
- `POST /api/auth/voter/login` – Authenticates voter credentials; verifies Active status; returns JWT token.
- `GET /api/auth/me` – Returns current authenticated user profile.

### Voter Management (Admin Only)
- `POST /api/voters` – Manually creates voter account with bcrypt password hashing.
- `GET /api/voters` – Retrieves all voters with search, department filtering, and pagination.
- `GET /api/voters/:id` – Fetches single voter details and participation count.
- `PUT /api/voters/:id` – Modifies voter details and profile photo.
- `DELETE /api/voters/:id` – Deletes voter account (blocked if voter has cast votes).
- `PATCH /api/voters/:id/status` – Toggles account status between Active and Inactive.
- `POST /api/voters/:id/reset-password` – Administratively updates a voter's password.

### Election Management
- `POST /api/elections` – Creates election with date/time voting windows.
- `GET /api/elections` – Lists elections with posts, candidate counts, and user voting progress.
- `GET /api/elections/:id` – Retrieves election with posts and assigned candidates.
- `PUT /api/elections/:id` – Updates election metadata.
- `DELETE /api/elections/:id` – Deletes election (blocked if votes exist).
- `PATCH /api/elections/:id/status` – Starts ('Active') or stops ('Completed') an election.

### Positions & Candidates
- `POST /api/posts` – Adds contested position to an election.
- `GET /api/posts` – Lists positions with candidate rosters.
- `PUT /api/posts/:id` – Updates position title or description.
- `DELETE /api/posts/:id` – Deletes position before voting starts.
- `POST /api/candidates` – Registers candidate with photo and symbol upload.
- `GET /api/candidates` – Lists candidates filtered by election and post.
- `PUT /api/candidates/:id` – Updates candidate details, photo, or symbol.
- `DELETE /api/candidates/:id` – Deletes candidate (blocked if votes exist).
- `PATCH /api/candidates/:id/status` – Toggles candidate Active/Inactive status.

### Voting & Results
- `POST /api/votes/cast` – Atomically records participation and secret ballot.
- `GET /api/votes/status` – Returns voting participation history for logged-in voter.
- `GET /api/votes/available` – Returns active elections and remaining posts for current voter.
- `GET /api/results/:electionId` – Computes candidate tallies, percentages, and winners.
- `GET /api/results/:electionId/export` – Downloads official election outcome as CSV report.
- `GET /api/results/admin/summary` – High-level metrics for Administrator Dashboard.

---

## 7. Verification & Automated Test Results

The backend includes an automated test runner (`server/tests/api.test.js`) testing all 15 scenarios specified in the master guidelines:

| # | Test Scenario | Verified Behavior | Status |
|---|---|---|---|
| 1 | Admin Login (Valid Credentials) | Successfully returns JWT token and admin role claim | ✅ PASSED |
| 2 | Admin Login (Invalid Credentials) | Rejected with HTTP 401 Unauthorized | ✅ PASSED |
| 3 | Admin Creates Voter Account | Voter provisioned; password hashed with bcrypt; excluded from response | ✅ PASSED |
| 4 | Admin Edits Voter Details | Department and details updated; verified in DB | ✅ PASSED |
| 5 | Admin Creates Election | Election created with scheduled dates and start/end times | ✅ PASSED |
| 6 | Admin Adds Position/Post | Contested post added and referenced to election | ✅ PASSED |
| 7 | Admin Adds Candidates | Nominees added with symbols and assigned to post | ✅ PASSED |
| 8 | Voter Logs In | Voter authenticated with admin-issued User ID and password | ✅ PASSED |
| 9 | Voter Views Active Elections | Available posts and candidates rendered | ✅ PASSED |
| 10 | Voter Casts Vote Successfully | Vote recorded; anonymous ballot token returned | ✅ PASSED |
| 11 | Duplicate Vote Attempt | Repeated submission for same post rejected with HTTP 400 | ✅ PASSED |
| 12 | Voter Access to Admin APIs | Role guard blocks access with HTTP 403 Forbidden | ✅ PASSED |
| 13 | Voter Access to Hidden Results | Results blocked until published with HTTP 403 Forbidden | ✅ PASSED |
| 14 | Admin Views Results & Winner | Tallies calculated; winner correctly identified | ✅ PASSED |
| 15 | Secret Ballot Privacy Check | Vote collection contains NO voterId, verifying anonymity | ✅ PASSED |

**Total:** 15 Passed | 0 Failed

---

## 8. Deployment Strategy

### 8.1 Frontend Deployment on Vercel
1. Connect GitHub repository to Vercel.
2. Set Root Directory to `client`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
5. Deploy.

### 8.2 Backend Deployment on Render
1. Create a Web Service connected to the GitHub repository.
2. Set Root Directory to `server`.
3. Set Build Command to `npm install` and Start Command to `node server.js`.
4. Configure Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/votesecure`
   - `JWT_SECRET=super_secret_jwt_key_votesecure_2026_production`
   - `CLIENT_URL=https://your-frontend.vercel.app`
5. Deploy.

---

## 9. Conclusion & Academic Reflection

VoteSecure successfully demonstrates a complete, secure, responsive implementation of an institutional Online Voting Management System using the MERN stack. By enforcing strict administrative voter provisioning and decoupling ballot choices from voter identities, the application satisfies the dual requirements of democratic secrecy and tamper-resistant integrity. All 15 required functional and security test cases have been verified with 100% pass rates.

# VoteSecure – Online Voting Management System
### Full-Stack MERN Web Development Training Project

---

## 1. Project Title
**VoteSecure – MERN Stack Based Online Voting Management System**

---

## 2. Project Description
**VoteSecure** is an enterprise-grade, responsive, full-stack online voting and election management system built using the genuine MERN stack (MongoDB, Express.js, React.js, and Node.js). 

Designed for collegiate student unions, academic departments, professional associations, and institutional governing boards, VoteSecure replaces cumbersome, error-prone manual paper balloting with a mathematically verifiable, tamper-resistant digital balloting platform. 

The application enforces **strict administrative voter provisioning**—eliminating voter roll inflation through zero public voter self-registration—and protects voter privacy using a **Decoupled Secret Balloting Protocol** where individual ballot choices are stored completely anonymized and detached from voter identities.

---

## 3. Problem Statement
Traditional elections in institutions suffer from systemic vulnerabilities:
1. **Physical Paper Ballot Manipulation & Theft:** Manual ballots are prone to physical tampering, ballot stuffing, damage, and loss.
2. **Administrative Overhead & Slowness:** Paper printing, distribution, manual headcount checks, and hand-counting take days and incur substantial monetary cost.
3. **Sybil Attacks in Generic Software:** Open web forms or generic polling tools allow public sign-ups, leading to unauthorized voter roll inflation and duplicate voting.
4. **Destruction of Secret Ballot Secrecy:** Naive web applications store the voter's identity and their selected candidate in the same database table, exposing who voted for whom to system administrators.
5. **Concurrency & Race Conditions:** Concurrent network requests or repeated button clicks during peak voting hours often result in double-counting before status flags update.

---

## 4. Project Objectives
- **Strict Role-Governed Access:** Establish isolated portals and authentication guards for Administrators and Voters.
- **Admin-Controlled Voter Provisioning:** Eliminate unauthorized self-registration by requiring administrators to manually create and manage voter accounts.
- **Dynamic Multi-Post Elections:** Support complex elections with multiple contested positions (e.g., President, Vice-President, Secretary) and individual candidate rosters.
- **Candidate Imagery & Ballot Symbols:** Enable upload and clear display of official candidate portraits and party/nominee symbols.
- **Constitutional Secret Balloting:** Decouple participation records from anonymous ballot tokens to guarantee that vote choices cannot be correlated to voter identities.
- **Deterministic Duplicate Prevention:** Enforce unique compound indexes in MongoDB to mathematically reject double voting attempts at the database engine level.
- **Real-Time Analytics & CSV Audits:** Deliver instant tallies, Recharts bar/pie charts, turnout metrics, winner declarations, and downloadable CSV audit files.

---

## 5. Technologies Used

### Frontend
- **React.js (v18/v19)** with Vite for high-performance component rendering
- **Tailwind CSS** with custom institutional palette (Slate, Royal Blue, Emerald, Crimson)
- **React Router DOM (v6)** for declarative and protected routing
- **Axios** with global request/response interceptors for JWT token handling
- **Recharts** for interactive Bar and Pie chart election analytics
- **Lucide React** for modern iconography
- **Canvas-Confetti** for celebratory vote confirmation feedback

### Backend
- **Node.js (v18+)** asynchronous runtime environment
- **Express.js (v4)** RESTful API framework
- **Multer** for multipart media stream processing (portraits and symbols)
- **Helmet.js** for essential HTTP security headers
- **CORS** for cross-origin resource validation
- **Express Rate Limit** to mitigate brute-force authentication attacks
- **Express Validator** for request payload validation and sanitization

### Database
- **MongoDB Atlas** for managed cloud database hosting
- **Mongoose ODM (v8)** for strict schema definition, validation, and compound indexing
- **mongodb-memory-server** for zero-configuration, instant local evaluation fallback

### Authentication & Cryptography
- **JSON Web Tokens (JWT)** for signed stateless authentication
- **bcrypt.js** for 10-round salted one-way password hashing
- **Node Crypto** for generating cryptographically secure anonymous ballot tokens

### Version Control & Deployment
- **Git & GitHub** for version management
- **Vercel** for frontend single-page application distribution
- **Render** for backend Node.js web service hosting

---

## 6. Key Features
- **Zero Public Voter Registration:** Voters cannot register themselves. Only administrators can issue voter accounts.
- **Decoupled Secret Ballots:** Participation records and votes are stored in separate collections.
- **Anti-Concurrency Duplicate Guard:** Database-enforced compound index `{ voterId, electionId, postId }` strictly prevents double voting.
- **Interactive Voting Booth:** 9-step wizard with position tabs, candidate cards, symbols, review modal, and confirmation receipts.
- **Real-Time Result Tallies:** Live turnout metrics, bar/pie comparisons, winner banners, and downloadable official CSV reports.
- **Result Visibility Control:** Admins can hold results until polls close, preventing premature voter influence.
- **Zero-Config Local Fallback:** Automatically switches to an in-memory database if no external MongoDB URI is provided.

---

## 7. Admin Module Description
The Administrator Console provides complete control over the voting ecosystem:
- **Dashboard:** Real-time metrics (Total Voters, Active Polls, Ballots Cast, Participation %) and Recharts distribution graphs.
- **Voter Management:** Manual voter enrollment, search by name/ID, department filters, status activation toggles, and secure password reset.
- **Election Management:** Schedule elections with start/end dates and times; control lifecycle status (Upcoming, Active, Completed).
- **Position / Post Management:** Configure positions (e.g., President, Vice-President) and assign candidates to each post.
- **Candidate Management:** Register candidates with official portrait photos, ballot symbols, department, and manifestos.
- **Results Dashboard:** Real-time candidate tallies, turnout rates, winner declarations, result release toggles, and CSV exports.

---

## 8. Voter Module Description
The Voter Portal provides an intuitive, accessible voting experience:
- **Secure Sign In:** Voter authentication using admin-issued User ID and password (no self-registration link).
- **Voter Dashboard:** Personalized greeting, voter ID badge, active election alerts, and voting progress tracker.
- **Election Browser:** Directory of Active, Upcoming, and Completed elections.
- **Interactive Voting Booth:** Select post, review candidate portraits and symbols, choose candidate, review confirmation modal, and cast ballot.
- **Ballot Receipt:** Anonymous cryptographic ballot token with celebratory confetti animation.
- **Participation Audit Trail:** Complete audit history proving voter participation without revealing candidate choice.
- **Certified Results:** View published election outcomes and winners once released by the administrator.

---

## 9. System Architecture

```
[ Voter & Admin Browser Clients ]
               │
               ▼  HTTPS / REST (JWT Bearer Token)
[ Express.js API Gateway ]
  ├── Security: Helmet, CORS, Rate Limiter
  ├── Input Sanitization: Express Validator
  ├── Media: Multer File Storage
  └── Auth: JWT Verification & Role Guards (isAdmin / isVoter)
               │
               ▼
[ Business Controllers & Services ]
  ├── Auth & Voter Services
  ├── Election & Post Services
  └── Atomic Secret Ballot Service
               │
               ▼  Mongoose ODM
[ MongoDB Atlas Database ]
  ├── participations: { voterId, electionId, postId } (UNIQUE COMPOUND INDEX)
  └── votes: { electionId, postId, candidateId, ballotToken } (ANONYMOUS VAULT)
```

---

## 10. Database Design

### MongoDB Collections Schema
1. **Admin (`admins`):** `name`, `email` (unique), `password` (bcrypt hash), `role` ('admin').
2. **Voter (`voters`):** `fullName`, `userId` (unique), `password` (bcrypt hash), `registrationNumber` (unique), `email` (unique), `mobileNumber`, `department`, `year`, `profilePhoto`, `status` ('Active'|'Inactive'), `role` ('voter').
3. **Election (`elections`):** `electionName`, `description`, `startDate`, `endDate`, `startTime`, `endTime`, `status` ('Upcoming'|'Active'|'Completed'), `resultsPublished` (boolean).
4. **Post (`posts`):** `postName`, `description`, `electionId` (Ref: Election).
5. **Candidate (`candidates`):** `candidateName`, `candidateId` (unique), `photo`, `symbol`, `description`, `department`, `postId` (Ref: Post), `electionId` (Ref: Election), `status`.
6. **Participation (`participations`):** `voterId` (Ref: Voter), `electionId` (Ref: Election), `postId` (Ref: Post), `hasVoted`, `submittedAt`.  
   *Compound Unique Index:* `{ voterId: 1, electionId: 1, postId: 1 }`
7. **Vote (`votes`):** `electionId`, `postId`, `candidateId`, `ballotToken` (unique UUID).  
   *Note: Contains NO voter reference to preserve secret balloting.*

---

## 11. API Endpoints

### Authentication
- `POST /api/auth/admin/login` – Administrator login
- `POST /api/auth/voter/login` – Voter login
- `GET  /api/auth/me` – Retrieve current authenticated user profile

### Voter Management (Admin Only)
- `POST   /api/voters` – Create voter account
- `GET    /api/voters` – Get voters with search and filters
- `GET    /api/voters/:id` – Get single voter details
- `PUT    /api/voters/:id` – Update voter profile
- `DELETE /api/voters/:id` – Delete voter account
- `PATCH  /api/voters/:id/status` – Toggle Active/Inactive status
- `POST   /api/voters/:id/reset-password` – Reset voter password

### Election Management
- `POST   /api/elections` – Create election (Admin)
- `GET    /api/elections` – Get all elections
- `GET    /api/elections/:id` – Get single election with posts and candidates
- `PUT    /api/elections/:id` – Update election (Admin)
- `DELETE /api/elections/:id` – Delete election before voting begins (Admin)
- `PATCH  /api/elections/:id/status` – Update election lifecycle status (Admin)

### Positions & Candidates
- `POST   /api/posts` – Add position to election (Admin)
- `GET    /api/posts` – Get positions with candidate rosters
- `PUT    /api/posts/:id` – Update position (Admin)
- `DELETE /api/posts/:id` – Delete position before voting starts (Admin)
- `POST   /api/candidates` – Register candidate with photo and symbol (Admin)
- `GET    /api/candidates` – Get candidate list
- `GET    /api/candidates/:id` – Get candidate details
- `PUT    /api/candidates/:id` – Update candidate (Admin)
- `DELETE /api/candidates/:id` – Delete candidate (Admin)
- `PATCH  /api/candidates/:id/status` – Toggle candidate status (Admin)

### Voting & Results
- `POST /api/votes/cast` – Cast secret ballot (Voter)
- `GET  /api/votes/status` – Get voter participation history (Voter)
- `GET  /api/votes/available` – Get eligible elections and posts (Voter)
- `GET  /api/results/:electionId` – Get election tallies and winners
- `GET  /api/results/:electionId/export` – Download election results as CSV (Admin)
- `GET  /api/results/admin/summary` – Summary statistics for admin dashboard (Admin)

---

## 12. Project Folder Structure

```
votesecure/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   └── VoterLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AddCandidate.jsx
│   │   │   │   ├── AddVoter.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── AdminProfile.jsx
│   │   │   │   ├── CandidateManagement.jsx
│   │   │   │   ├── CreateElection.jsx
│   │   │   │   ├── EditElection.jsx
│   │   │   │   ├── EditVoter.jsx
│   │   │   │   ├── ElectionManagement.jsx
│   │   │   │   ├── PostManagement.jsx
│   │   │   │   ├── ResultsDashboard.jsx
│   │   │   │   └── VoterManagement.jsx
│   │   │   └── voter/
│   │   │       ├── VoterDashboard.jsx
│   │   │       ├── VoterElections.jsx
│   │   │       ├── VoterLogin.jsx
│   │   │       ├── VoterProfile.jsx
│   │   │       ├── VoterResults.jsx
│   │   │       ├── VotingBooth.jsx
│   │   │       └── VotingHistory.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── candidateService.js
│   │   │   ├── electionService.js
│   │   │   ├── postService.js
│   │   │   ├── resultService.js
│   │   │   ├── voterService.js
│   │   │   └── votingService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   ├── electionController.js
│   │   ├── postController.js
│   │   ├── resultController.js
│   │   ├── voteController.js
│   │   └── voterController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── uploadMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Candidate.js
│   │   ├── Election.js
│   │   ├── Participation.js
│   │   ├── Post.js
│   │   ├── Vote.js
│   │   └── Voter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── electionRoutes.js
│   │   ├── postRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── voteRoutes.js
│   │   └── voterRoutes.js
│   ├── scripts/
│   │   ├── captureScreenshots.js
│   │   ├── generatePresentation.js
│   │   └── seedFullDemo.js
│   ├── tests/
│   │   └── api.test.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── utils/
│   │   ├── seedAdmin.js
│   │   └── tokenUtils.js
│   ├── app.js
│   ├── package.json
│   └── server.js
│
├── docs/
│   ├── architecture.md
│   ├── project-report.md
│   └── screenshots/
│       ├── add_voter.png
│       ├── admin_dashboard.png
│       ├── admin_login.png
│       ├── candidate_management.png
│       ├── election_management.png
│       ├── landing_page.png
│       ├── results_dashboard.png
│       ├── voter_dashboard.png
│       ├── voter_login.png
│       ├── voter_management.png
│       └── voting_booth.png
│
├── presentation/
│   └── VoteSecure_Presentation.pptx
│
├── .env.example
├── .gitignore
├── README.md
└── team_details.csv
```

---

## 13. Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git
- MongoDB Atlas account (optional for local dev; built-in in-memory fallback included)

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/votesecure.git
cd votesecure
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 14. Environment Variable Configuration

Create `.env` inside `server/` using `.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
# (Leave empty to use automatic zero-config In-Memory MongoDB)
MONGODB_URI=mongodb+srv://admin:securepassword@cluster0.mongodb.net/votesecure?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=super_secret_jwt_key_votesecure_2026_secure_tokens
JWT_EXPIRE=24h

# Client URL (CORS whitelist)
CLIENT_URL=http://localhost:5173

# Default Admin Credentials (auto-seeded on first boot)
ADMIN_DEFAULT_NAME=System Administrator
ADMIN_DEFAULT_EMAIL=admin@votesecure.org
ADMIN_DEFAULT_PASSWORD=Admin@Secure2026!
```

Create `.env` inside `client/`:
```env
VITE_API_URL=/api
```

---

## 15. How to Run Frontend
In the `client` directory:
```bash
npm run dev
```
The React application will be available at: `http://localhost:5173`

---

## 16. How to Run Backend
In the `server` directory:
```bash
# Start server
npm start

# Or start in watch mode
npm run dev
```
The REST API will be available at: `http://localhost:5000/api`

### Run Automated Backend Test Suite
```bash
cd server
npm test
```
Verifies all 15 test scenarios (authentication, duplicate vote rejection, role guards, privacy verification) with 100% pass rates.

---

## 17. MongoDB Atlas Setup
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free tier).
3. Under **Database Access**, create a database user with Read and Write permissions.
4. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere for cloud deployment).
5. In your cluster dashboard, click **Connect** > **Drivers** > copy the connection string.
6. Replace `<username>` and `<password>` with your database user credentials.
7. Paste this connection string into `server/.env` as `MONGODB_URI`.

---

## 18. Deployment Instructions

### Frontend Deployment on Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `client`.
5. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
6. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-app.onrender.com/api`
7. Click **Deploy**.

### Backend Deployment on Render
1. Sign in to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_production_secret_key`
   - `CLIENT_URL=https://your-frontend-app.vercel.app`
7. Click **Create Web Service**.

---

## 19. Application Screenshots

| Page | Preview |
|---|---|
| **Landing Page** | `docs/screenshots/landing_page.png` |
| **Admin Login** | `docs/screenshots/admin_login.png` |
| **Administrator Dashboard** | `docs/screenshots/admin_dashboard.png` |
| **Voter Registry Management** | `docs/screenshots/voter_management.png` |
| **Provision New Voter** | `docs/screenshots/add_voter.png` |
| **Election Management** | `docs/screenshots/election_management.png` |
| **Candidate Management** | `docs/screenshots/candidate_management.png` |
| **Results & Audit Dashboard** | `docs/screenshots/results_dashboard.png` |
| **Voter Login** | `docs/screenshots/voter_login.png` |
| **Voter Portal Dashboard** | `docs/screenshots/voter_dashboard.png` |
| **Interactive Voting Booth** | `docs/screenshots/voting_booth.png` |

---

## 20. Team Members

- **Team Member 1:** [Enter Name] – [Registration Number]
- **Team Member 2:** [Enter Name] – [Registration Number]
- **Team Member 3:** [Enter Name] – [Registration Number]

**Team Name:** [Enter Unique Team Name]

---

## Git Initialization and Push Commands

```bash
git init
git add .
git commit -m "Initial VoteSecure project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

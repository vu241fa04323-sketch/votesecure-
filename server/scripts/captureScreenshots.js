const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const { connectDB, disconnectDB } = require('../config/db');
const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');
const { generateToken } = require('../utils/tokenUtils');
const crypto = require('crypto');

async function main() {
  console.log('📸 Launching VoteSecure High-Fidelity Screenshot Capture Engine...');

  const screenshotsDir = path.join(__dirname, '..', '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Connect DB and seed full demo records
  await connectDB();
  await Admin.deleteMany({});
  await Voter.deleteMany({});
  await Election.deleteMany({});
  await Post.deleteMany({});
  await Candidate.deleteMany({});
  await Vote.deleteMany({});
  await Participation.deleteMany({});

  const admin = await Admin.create({
    name: 'System Administrator',
    email: 'admin@votesecure.org',
    password: 'Admin@Secure2026!',
    role: 'admin',
  });

  const voter1 = await Voter.create({
    fullName: 'Alice Johnson',
    userId: 'VOTER202601',
    password: 'Password@123',
    registrationNumber: 'REG-2026-001',
    email: 'alice.johnson@university.edu',
    mobileNumber: '+1 555-0101',
    department: 'Computer Science',
    year: 'Final Year',
    status: 'Active',
  });

  const voter2 = await Voter.create({
    fullName: 'Brian Smith',
    userId: 'VOTER202602',
    password: 'Password@123',
    registrationNumber: 'REG-2026-002',
    email: 'brian.smith@university.edu',
    mobileNumber: '+1 555-0102',
    department: 'Business Administration',
    year: '3rd Year',
    status: 'Active',
  });

  const voter3 = await Voter.create({
    fullName: 'Catherine Lee',
    userId: 'VOTER202603',
    password: 'Password@123',
    registrationNumber: 'REG-2026-003',
    email: 'catherine.lee@university.edu',
    mobileNumber: '+1 555-0103',
    department: 'Electrical Engineering',
    year: '2nd Year',
    status: 'Active',
  });

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const election = await Election.create({
    electionName: 'Annual Student Union General Election 2026',
    description: 'Official university-wide election to choose the executive cabinet for the 2026-2027 council.',
    startDate: today,
    endDate: nextWeek,
    startTime: '08:00',
    endTime: '20:00',
    status: 'Active',
    resultsPublished: true,
  });

  const postPres = await Post.create({
    postName: 'President',
    description: 'Executive council leader, university spokesperson, and president of the student union.',
    electionId: election._id,
  });

  const postVP = await Post.create({
    postName: 'Vice President',
    description: 'Deputy executive leader and student welfare director.',
    electionId: election._id,
  });

  const cand1 = await Candidate.create({
    candidateName: 'Sarah Connor',
    candidateId: 'CAND-PRES-01',
    description: 'Committed to campus sustainability, 24/7 library access, and expanded research stipends.',
    department: 'Computer Science',
    postId: postPres._id,
    electionId: election._id,
    status: 'Active',
  });

  const cand2 = await Candidate.create({
    candidateName: 'Marcus Wright',
    candidateId: 'CAND-PRES-02',
    description: 'Advocating for student welfare, career mentorship, and sports team sponsorships.',
    department: 'Business Administration',
    postId: postPres._id,
    electionId: election._id,
    status: 'Active',
  });

  const cand3 = await Candidate.create({
    candidateName: 'Priya Sharma',
    candidateId: 'CAND-VP-01',
    description: 'Championing equal opportunities and international student housing support.',
    department: 'Biotechnology',
    postId: postVP._id,
    electionId: election._id,
    status: 'Active',
  });

  // Seed sample votes
  await Participation.create({
    voterId: voter1._id,
    electionId: election._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election._id,
    postId: postPres._id,
    candidateId: cand1._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  await Participation.create({
    voterId: voter2._id,
    electionId: election._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election._id,
    postId: postPres._id,
    candidateId: cand1._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  await Participation.create({
    voterId: voter3._id,
    electionId: election._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election._id,
    postId: postPres._id,
    candidateId: cand2._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  console.log('✅ Demo database seeded with real votes.');

  // 2. Start combined express server on port 5173
  const app = require('../app');
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(5173, () => {
      console.log('🚀 Combined server running on http://localhost:5173');
      resolve(s);
    });
  });

  // 3. Launch Chrome with puppeteer-core
  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log(`🌐 Launching browser from: ${chromePath}`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  // Helper to capture a screenshot
  const takeShot = async (url, fileName, setupFn = null) => {
    console.log(`📸 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    if (setupFn) {
      await setupFn(page);
      await new Promise(r => setTimeout(r, 800)); // wait for DOM update
    }
    const dest = path.join(screenshotsDir, fileName);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`✅ Saved: ${fileName}`);
  };

  // 1. Landing Page
  await takeShot('http://localhost:5173/', 'landing_page.png');

  // 2. Admin Login
  await takeShot('http://localhost:5173/admin/login', 'admin_login.png');

  // 3. Voter Login
  await takeShot('http://localhost:5173/voter/login', 'voter_login.png');

  // Setup Admin Session in localStorage
  const adminToken = generateToken({ id: admin._id, role: 'admin' });
  const adminUserData = { id: admin._id, name: admin.name, email: admin.email, role: 'admin' };

  const setAdminAuth = async (p) => {
    await p.evaluate((token, user) => {
      localStorage.setItem('votesecure_token', token);
      localStorage.setItem('votesecure_user', JSON.stringify(user));
    }, adminToken, adminUserData);
  };

  // 4. Admin Dashboard
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await setAdminAuth(page);
  await takeShot('http://localhost:5173/admin/dashboard', 'admin_dashboard.png');

  // 5. Voter Management
  await takeShot('http://localhost:5173/admin/voters', 'voter_management.png');

  // 6. Add Voter Page
  await takeShot('http://localhost:5173/admin/voters/new', 'add_voter.png');

  // 7. Election Management
  await takeShot('http://localhost:5173/admin/elections', 'election_management.png');

  // 8. Candidate Management
  await takeShot('http://localhost:5173/admin/candidates', 'candidate_management.png');

  // 9. Results Dashboard
  await takeShot('http://localhost:5173/admin/results', 'results_dashboard.png');

  // Setup Voter Session in localStorage
  const voterToken = generateToken({ id: voter1._id, role: 'voter' });
  const voterUserData = {
    id: voter1._id,
    fullName: voter1.fullName,
    userId: voter1.userId,
    registrationNumber: voter1.registrationNumber,
    department: voter1.department,
    year: voter1.year,
    role: 'voter',
    status: 'Active',
  };

  const setVoterAuth = async (p) => {
    await p.evaluate((token, user) => {
      localStorage.setItem('votesecure_token', token);
      localStorage.setItem('votesecure_user', JSON.stringify(user));
    }, voterToken, voterUserData);
  };

  // 10. Voter Dashboard
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await setVoterAuth(page);
  await takeShot('http://localhost:5173/voter/dashboard', 'voter_dashboard.png');

  // 11. Voting Booth
  await takeShot(`http://localhost:5173/voter/vote/${election._id}`, 'voting_booth.png');

  await browser.close();
  server.close();
  await disconnectDB();

  console.log('🎉 All 11 actual screenshots captured successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal screenshot error:', err);
  process.exit(1);
});

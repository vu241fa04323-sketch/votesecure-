const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');
const crypto = require('crypto');

async function seedData() {
  console.log('🌱 Seeding rich demo data for VoteSecure showcase...');

  await connectDB();

  // Clear existing data
  await Admin.deleteMany({});
  await Voter.deleteMany({});
  await Election.deleteMany({});
  await Post.deleteMany({});
  await Candidate.deleteMany({});
  await Vote.deleteMany({});
  await Participation.deleteMany({});

  // 1. Seed Admin
  const admin = await Admin.create({
    name: 'System Administrator',
    email: 'admin@votesecure.org',
    password: 'Admin@Secure2026!',
    role: 'admin',
  });
  console.log('✅ Admin seeded: admin@votesecure.org');

  // 2. Seed Voters
  const sampleVoters = [
    {
      fullName: 'Alice Johnson',
      userId: 'VOTER202601',
      password: 'Password@123',
      registrationNumber: 'REG-2026-001',
      email: 'alice.johnson@university.edu',
      mobileNumber: '+1 555-0101',
      department: 'Computer Science',
      year: 'Final Year',
      status: 'Active',
    },
    {
      fullName: 'Brian Smith',
      userId: 'VOTER202602',
      password: 'Password@123',
      registrationNumber: 'REG-2026-002',
      email: 'brian.smith@university.edu',
      mobileNumber: '+1 555-0102',
      department: 'Business Administration',
      year: '3rd Year',
      status: 'Active',
    },
    {
      fullName: 'Catherine Lee',
      userId: 'VOTER202603',
      password: 'Password@123',
      registrationNumber: 'REG-2026-003',
      email: 'catherine.lee@university.edu',
      mobileNumber: '+1 555-0103',
      department: 'Electrical Engineering',
      year: '2nd Year',
      status: 'Active',
    },
    {
      fullName: 'David Miller',
      userId: 'VOTER202604',
      password: 'Password@123',
      registrationNumber: 'REG-2026-004',
      email: 'david.miller@university.edu',
      mobileNumber: '+1 555-0104',
      department: 'Mechanical Engineering',
      year: '1st Year',
      status: 'Active',
    },
    {
      fullName: 'Elena Rostova',
      userId: 'VOTER202605',
      password: 'Password@123',
      registrationNumber: 'REG-2026-005',
      email: 'elena.rostova@university.edu',
      mobileNumber: '+1 555-0105',
      department: 'Biotechnology',
      year: 'Postgraduate',
      status: 'Active',
    },
    {
      fullName: 'Farhan Akhtar',
      userId: 'VOTER202606',
      password: 'Password@123',
      registrationNumber: 'REG-2026-006',
      email: 'farhan.akhtar@university.edu',
      mobileNumber: '+1 555-0106',
      department: 'Civil Engineering',
      year: 'Final Year',
      status: 'Inactive',
    },
  ];

  const createdVoters = [];
  for (const v of sampleVoters) {
    const voter = await Voter.create(v);
    createdVoters.push(voter);
  }
  console.log(`✅ Seeded ${createdVoters.length} sample voters.`);

  // 3. Seed Elections
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const election1 = await Election.create({
    electionName: 'Annual Student Union General Election 2026',
    description: 'Official collegiate election to choose the executive cabinet for the 2026-2027 academic council.',
    startDate: today,
    endDate: nextWeek,
    startTime: '08:00',
    endTime: '20:00',
    status: 'Active',
    resultsPublished: true,
  });

  const election2 = await Election.create({
    electionName: 'Faculty Academic Senate Representative Poll',
    description: 'Elections for student representation in the university faculty academic senate board.',
    startDate: nextWeek,
    endDate: nextMonth,
    startTime: '09:00',
    endTime: '17:00',
    status: 'Upcoming',
    resultsPublished: false,
  });
  console.log('✅ Seeded 2 elections (Active & Upcoming).');

  // 4. Seed Posts for Election 1
  const postPres = await Post.create({
    postName: 'President',
    description: 'Executive council leader, university spokesperson, and president of the student union.',
    electionId: election1._id,
  });

  const postVP = await Post.create({
    postName: 'Vice President',
    description: 'Chair of student welfare committees and deputy executive to the president.',
    electionId: election1._id,
  });

  const postSec = await Post.create({
    postName: 'General Secretary',
    description: 'Chief administrator of student events, documentation, and society budgets.',
    electionId: election1._id,
  });
  console.log('✅ Seeded 3 positions (President, VP, General Secretary).');

  // 5. Seed Candidates
  const cand1 = await Candidate.create({
    candidateName: 'Sarah Connor',
    candidateId: 'CAND-PRES-01',
    description: 'Committed to campus sustainability, 24/7 library access, and expanded research stipends.',
    department: 'Computer Science',
    postId: postPres._id,
    electionId: election1._id,
    status: 'Active',
  });

  const cand2 = await Candidate.create({
    candidateName: 'Marcus Wright',
    candidateId: 'CAND-PRES-02',
    description: 'Advocating for reduced student meal costs, mental health support, and varsity sports sponsorships.',
    department: 'Business Administration',
    postId: postPres._id,
    electionId: election1._id,
    status: 'Active',
  });

  const cand3 = await Candidate.create({
    candidateName: 'Priya Sharma',
    candidateId: 'CAND-VP-01',
    description: 'Focused on equal opportunities, international student housing support, and student welfare.',
    department: 'Biotechnology',
    postId: postVP._id,
    electionId: election1._id,
    status: 'Active',
  });

  const cand4 = await Candidate.create({
    candidateName: 'Alexander Drake',
    candidateId: 'CAND-VP-02',
    description: 'Championing industry internship fairs, corporate sponsorships, and campus transit reforms.',
    department: 'Mechanical Engineering',
    postId: postVP._id,
    electionId: election1._id,
    status: 'Active',
  });

  const cand5 = await Candidate.create({
    candidateName: 'Chloe Bennett',
    candidateId: 'CAND-SEC-01',
    description: 'Dedicated to transparent society accounting, digital booking portals, and club funding transparency.',
    department: 'Commerce & Finance',
    postId: postSec._id,
    electionId: election1._id,
    status: 'Active',
  });
  console.log('✅ Seeded 5 contesting candidates across posts.');

  // 6. Seed Votes and Participation for demo results
  // Voters 1, 2, 3 vote for President
  const votersWhoVoted = [createdVoters[0], createdVoters[1], createdVoters[2], createdVoters[3]];

  // Voter 0 votes for Sarah Connor (President)
  await Participation.create({
    voterId: votersWhoVoted[0]._id,
    electionId: election1._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election1._id,
    postId: postPres._id,
    candidateId: cand1._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  // Voter 1 votes for Sarah Connor (President)
  await Participation.create({
    voterId: votersWhoVoted[1]._id,
    electionId: election1._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election1._id,
    postId: postPres._id,
    candidateId: cand1._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  // Voter 2 votes for Marcus Wright (President)
  await Participation.create({
    voterId: votersWhoVoted[2]._id,
    electionId: election1._id,
    postId: postPres._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election1._id,
    postId: postPres._id,
    candidateId: cand2._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  // Voter 0 & 1 vote for Priya Sharma (VP)
  for (const v of [votersWhoVoted[0], votersWhoVoted[1]]) {
    await Participation.create({
      voterId: v._id,
      electionId: election1._id,
      postId: postVP._id,
      hasVoted: true,
    });
    await Vote.create({
      electionId: election1._id,
      postId: postVP._id,
      candidateId: cand3._id,
      ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
    });
  }

  // Voter 2 votes for Alexander Drake (VP)
  await Participation.create({
    voterId: votersWhoVoted[2]._id,
    electionId: election1._id,
    postId: postVP._id,
    hasVoted: true,
  });
  await Vote.create({
    electionId: election1._id,
    postId: postVP._id,
    candidateId: cand4._id,
    ballotToken: `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`,
  });

  console.log('✅ Seeded realistic votes and participation audit records.');
  console.log('🎉 Full demo database successfully initialized!');

  process.exit(0);
}

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});

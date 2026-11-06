const assert = require('assert');
const http = require('http');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDefaultAdmin } = require('../utils/seedAdmin');
const app = require('../app');
const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');

let server;
let baseUrl;

// Helper to make HTTP requests
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING VOTESECURE BACKEND AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error(err);
      failed++;
    }
  };

  try {
    // 1. Connect DB and seed default admin
    await connectDB();
    await seedDefaultAdmin();

    // 2. Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    let adminToken = '';
    let voterToken = '';
    let testVoterId = '';
    let testElectionId = '';
    let testPostId = '';
    let testCandidateId1 = '';
    let testCandidateId2 = '';

    // Test 1: Admin login with valid credentials
    await test('1. Admin login with valid credentials', async () => {
      const res = await request('POST', '/api/auth/admin/login', {
        email: 'admin@votesecure.org',
        password: 'Admin@Secure2026!',
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token, 'Token must be returned');
      assert.strictEqual(res.body.user.role, 'admin');
      adminToken = res.body.token;
    });

    // Test 2: Admin login with invalid credentials
    await test('2. Admin login with invalid credentials', async () => {
      const res = await request('POST', '/api/auth/admin/login', {
        email: 'admin@votesecure.org',
        password: 'WrongPassword999',
      });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });

    // Test 3: Admin creates a voter account
    await test('3. Admin creates a voter account', async () => {
      const res = await request(
        'POST',
        '/api/voters',
        {
          fullName: 'Alice Johnson',
          userId: 'VOTER202601',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          registrationNumber: 'REG-2026-001',
          email: 'alice.johnson@university.edu',
          mobileNumber: '+1234567890',
          department: 'Computer Science',
          year: 'Final Year',
          status: 'Active',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.voter._id);
      assert.strictEqual(res.body.voter.userId, 'VOTER202601');
      assert.strictEqual(res.body.voter.password, undefined, 'Password must not be returned');
      testVoterId = res.body.voter._id;
    });

    // Test 4: Admin edits voter information
    await test('4. Admin edits voter information', async () => {
      const res = await request(
        'PUT',
        `/api/voters/${testVoterId}`,
        {
          department: 'Information Technology',
          year: '3rd Year',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.voter.department, 'Information Technology');
    });

    // Test 5: Admin creates an election
    await test('5. Admin creates an election', async () => {
      const today = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];

      const res = await request(
        'POST',
        '/api/elections',
        {
          electionName: 'Annual Student Union Election 2026',
          description: 'Official university wide student council election',
          startDate,
          endDate,
          startTime: '00:00',
          endTime: '23:59',
          status: 'Active',
          resultsPublished: false,
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.election._id);
      testElectionId = res.body.election._id;
    });

    // Test 6: Admin adds posts to an election
    await test('6. Admin adds posts to an election', async () => {
      const res = await request(
        'POST',
        '/api/posts',
        {
          postName: 'President',
          description: 'Chief executive leader of the student union',
          electionId: testElectionId,
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.post._id);
      testPostId = res.body.post._id;
    });

    // Test 7: Admin adds candidates to post
    await test('7. Admin adds candidates with symbols to post', async () => {
      // Candidate 1
      const res1 = await request(
        'POST',
        '/api/candidates',
        {
          candidateName: 'Sarah Connor',
          candidateId: 'CAND-001',
          description: 'Visionary leadership for campus sustainability',
          department: 'Computer Science',
          postId: testPostId,
          electionId: testElectionId,
          status: 'Active',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res1.statusCode, 201);
      testCandidateId1 = res1.body.candidate._id;

      // Candidate 2
      const res2 = await request(
        'POST',
        '/api/candidates',
        {
          candidateName: 'John Doe',
          candidateId: 'CAND-002',
          description: 'Advocate for student welfare and career development',
          department: 'Business Administration',
          postId: testPostId,
          electionId: testElectionId,
          status: 'Active',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      assert.strictEqual(res2.statusCode, 201);
      testCandidateId2 = res2.body.candidate._id;
    });

    // Test 8: Voter logs in using admin-created credentials
    await test('8. Voter logs in using admin-created credentials', async () => {
      const res = await request('POST', '/api/auth/voter/login', {
        userId: 'VOTER202601',
        password: 'Password@123',
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, 'voter');
      assert.strictEqual(res.body.user.userId, 'VOTER202601');
      voterToken = res.body.token;
    });

    // Test 9: Voter views active elections and candidates
    await test('9. Voter views active elections', async () => {
      const res = await request('GET', `/api/elections/${testElectionId}`, null, {
        Authorization: `Bearer ${voterToken}`,
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.posts.length, 1);
      assert.strictEqual(res.body.posts[0].candidates.length, 2);
    });

    // Test 10: Voter casts a vote successfully
    await test('10. Voter casts a vote successfully', async () => {
      const res = await request(
        'POST',
        '/api/votes/cast',
        {
          electionId: testElectionId,
          postId: testPostId,
          candidateId: testCandidateId1,
        },
        { Authorization: `Bearer ${voterToken}` }
      );
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.receipt.ballotToken, 'Ballot token must be issued');
    });

    // Test 11: Voter attempts to vote twice for the same post (duplicate vote prevention)
    await test('11. Voter attempts to vote twice for the same post (Must be rejected)', async () => {
      const res = await request(
        'POST',
        '/api/votes/cast',
        {
          electionId: testElectionId,
          postId: testPostId,
          candidateId: testCandidateId2,
        },
        { Authorization: `Bearer ${voterToken}` }
      );
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('already'));
    });

    // Test 12: Voter attempts to access admin endpoint (Role authorization guard)
    await test('12. Voter attempts to access admin endpoint (Must be 403 Forbidden)', async () => {
      const res = await request('GET', '/api/voters', null, {
        Authorization: `Bearer ${voterToken}`,
      });
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });

    // Test 13: Voter attempts to view unpublished results (Access control)
    await test('13. Voter attempts to view unpublished results (Must be 403 Forbidden)', async () => {
      const res = await request('GET', `/api/results/${testElectionId}`, null, {
        Authorization: `Bearer ${voterToken}`,
      });
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });

    // Test 14: Admin views election results and analytics
    await test('14. Admin views election results and winner verification', async () => {
      const res = await request('GET', `/api/results/${testElectionId}`, null, {
        Authorization: `Bearer ${adminToken}`,
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.results.totalVotesCast, 1);
      assert.strictEqual(res.body.results.posts[0].candidates[0].votesReceived, 1);
      assert.strictEqual(res.body.results.posts[0].winners[0].candidateName, 'Sarah Connor');
    });

    // Test 15: Secret ballot privacy verification (No voter ID stored in Vote collection)
    await test('15. Verify secret ballot privacy: Vote contains no voter ID', async () => {
      const voteRecord = await Vote.findOne({ electionId: testElectionId });
      assert.ok(voteRecord, 'Vote record must exist');
      assert.strictEqual(voteRecord.voterId, undefined, 'Vote record must not contain voterId');
      assert.ok(voteRecord.ballotToken, 'Vote must contain anonymous ballotToken');
    });

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

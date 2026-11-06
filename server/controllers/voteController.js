const crypto = require('crypto');
const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');
const Voter = require('../models/Voter');

// @desc    Cast a vote for a candidate in a post
// @route   POST /api/votes/cast
// @access  Private/Voter
const castVote = async (req, res, next) => {
  try {
    const { electionId, postId, candidateId } = req.body;
    const voterId = req.user.id;

    // 1. Verify voter account status
    const voter = await Voter.findById(voterId);
    if (!voter || voter.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your voter account is inactive or not authorized to vote.',
      });
    }

    // 2. Verify election status and voting period
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    if (election.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `This election is currently '${election.status}'. Voting is only permitted during 'Active' elections.`,
      });
    }

    // Check election period
    const now = new Date();
    const startDateTime = new Date(`${election.startDate}T${election.startTime}:00`);
    const endDateTime = new Date(`${election.endDate}T${election.endTime}:00`);

    if (now < startDateTime) {
      return res.status(400).json({
        success: false,
        message: `Voting has not started yet. This election opens on ${election.startDate} at ${election.startTime}.`,
      });
    }

    if (now > endDateTime) {
      return res.status(400).json({
        success: false,
        message: `Voting has closed for this election. Deadline was ${election.endDate} at ${election.endTime}.`,
      });
    }

    // 3. Verify post belongs to this election
    const post = await Post.findOne({ _id: postId, electionId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Specified post/position does not exist in this election.',
      });
    }

    // 4. Verify candidate exists, is active, and assigned to this post
    const candidate = await Candidate.findOne({
      _id: candidateId,
      postId,
      electionId,
      status: 'Active',
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Invalid candidate selection. Candidate is inactive or not running for this post.',
      });
    }

    // 5. Check if voter has already voted for this post in this election
    const existingParticipation = await Participation.findOne({
      voterId,
      electionId,
      postId,
    });

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate vote rejected. You have already cast your vote for this post.',
      });
    }

    // 6. Record Participation first to leverage the unique compound index
    // If a concurrent request slips through, the index { voterId, electionId, postId } rejects it with duplicate key error!
    let participationRecord;
    try {
      participationRecord = await Participation.create({
        voterId,
        electionId,
        postId,
        hasVoted: true,
        submittedAt: new Date(),
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate submission blocked: You have already voted for this post.',
        });
      }
      throw dbErr;
    }

    // 7. Generate a cryptographically secure anonymous ballot token
    const ballotToken = `BALLOT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

    // 8. Store anonymous vote record (decoupled from voter identity for absolute secret ballot privacy)
    const recordedVote = await Vote.create({
      electionId,
      postId,
      candidateId,
      ballotToken,
    });

    res.status(201).json({
      success: true,
      message: 'Your vote has been cast and securely recorded!',
      receipt: {
        electionName: election.electionName,
        postName: post.postName,
        ballotToken,
        submittedAt: participationRecord.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get voting status and history for currently authenticated voter
// @route   GET /api/votes/status
// @access  Private/Voter
const getVoterStatus = async (req, res, next) => {
  try {
    const voterId = req.user.id;

    const participations = await Participation.find({ voterId })
      .populate('electionId', 'electionName status startDate endDate')
      .populate('postId', 'postName')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: participations.length,
      history: participations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available active elections and voting progress for current voter
// @route   GET /api/votes/available
// @access  Private/Voter
const getAvailableElections = async (req, res, next) => {
  try {
    const voterId = req.user.id;

    // Find all elections
    const elections = await Election.find().sort({ createdAt: -1 });

    const available = await Promise.all(
      elections.map(async (elec) => {
        const posts = await Post.find({ electionId: elec._id });
        const postIds = posts.map((p) => p._id);

        const participations = await Participation.find({
          voterId,
          electionId: elec._id,
        });

        const votedPostIds = participations.map((p) => p.postId.toString());

        return {
          ...elec.toObject(),
          totalPosts: posts.length,
          votedPostsCount: votedPostIds.length,
          isFullyVoted: posts.length > 0 && votedPostIds.length >= posts.length,
          remainingPostsCount: Math.max(0, posts.length - votedPostIds.length),
        };
      })
    );

    res.status(200).json({
      success: true,
      elections: available,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  castVote,
  getVoterStatus,
  getAvailableElections,
};

const Election = require('../models/Election');
const Post = require('../models/Post');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Participation = require('../models/Participation');

// @desc    Create new election
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res, next) => {
  try {
    const {
      electionName,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      status,
      resultsPublished,
    } = req.body;

    const election = await Election.create({
      electionName,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      status: status || 'Upcoming',
      resultsPublished: !!resultsPublished,
    });

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all elections (filtered for role)
// @route   GET /api/elections
// @access  Private (Admin or Voter)
const getElections = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    // If voter, only show Active or Completed elections (with published results), or Upcoming
    const elections = await Election.find(query).sort({ createdAt: -1 });

    // Enhance with post and candidate counts
    const electionsWithMeta = await Promise.all(
      elections.map(async (elec) => {
        const postCount = await Post.countDocuments({ electionId: elec._id });
        const candidateCount = await Candidate.countDocuments({ electionId: elec._id });
        const voteCount = await Vote.countDocuments({ electionId: elec._id });
        
        let voterParticipationCount = 0;
        if (req.user && req.user.role === 'voter') {
          voterParticipationCount = await Participation.countDocuments({
            electionId: elec._id,
            voterId: req.user.id,
          });
        }

        return {
          ...elec.toObject(),
          postCount,
          candidateCount,
          voteCount,
          hasUserVotedAllPosts: postCount > 0 && voterParticipationCount >= postCount,
          userParticipationCount: voterParticipationCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: electionsWithMeta.length,
      elections: electionsWithMeta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single election with its posts and candidates
// @route   GET /api/elections/:id
// @access  Private (Admin or Voter)
const getElectionById = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const posts = await Post.find({ electionId: election._id }).sort({ createdAt: 1 });
    const candidates = await Candidate.find({ electionId: election._id, status: 'Active' }).sort({
      createdAt: 1,
    });

    // If request from voter, determine which posts this voter has already voted on
    let votedPostIds = [];
    if (req.user && req.user.role === 'voter') {
      const participations = await Participation.find({
        voterId: req.user.id,
        electionId: election._id,
      });
      votedPostIds = participations.map((p) => p.postId.toString());
    }

    // Group candidates by post
    const postsWithCandidates = posts.map((post) => {
      const postCandidates = candidates.filter(
        (c) => c.postId.toString() === post._id.toString()
      );
      return {
        ...post.toObject(),
        candidates: postCandidates,
        hasVoted: votedPostIds.includes(post._id.toString()),
      };
    });

    res.status(200).json({
      success: true,
      election,
      posts: postsWithCandidates,
      votedPostIds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
const updateElection = async (req, res, next) => {
  try {
    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const {
      electionName,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      status,
      resultsPublished,
    } = req.body;

    election.electionName = electionName || election.electionName;
    election.description = description || election.description;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;
    election.startTime = startTime || election.startTime;
    election.endTime = endTime || election.endTime;
    if (status) election.status = status;
    if (resultsPublished !== undefined) election.resultsPublished = resultsPublished;

    await election.save();

    res.status(200).json({
      success: true,
      message: 'Election updated successfully',
      election,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete election before voting begins
// @route   DELETE /api/elections/:id
// @access  Private/Admin
const deleteElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // Check if votes exist
    const voteCount = await Vote.countDocuments({ electionId: election._id });
    if (voteCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete election: Votes have already been cast. Mark it as Completed instead.',
      });
    }

    // Delete associated posts and candidates
    await Candidate.deleteMany({ electionId: election._id });
    await Post.deleteMany({ electionId: election._id });
    await Election.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Election and associated posts and candidates deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update election status (Upcoming / Active / Completed)
// @route   PATCH /api/elections/:id/status
// @access  Private/Admin
const updateElectionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Upcoming', 'Active', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: Upcoming, Active, Completed',
      });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    election.status = status;
    await election.save();

    res.status(200).json({
      success: true,
      message: `Election status updated to ${status}`,
      election,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  updateElectionStatus,
};

const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// @desc    Add candidate
// @route   POST /api/candidates
// @access  Private/Admin
const createCandidate = async (req, res, next) => {
  try {
    const {
      candidateName,
      candidateId,
      description,
      department,
      postId,
      electionId,
      status,
    } = req.body;

    const existingCandidate = await Candidate.findOne({
      candidateId: candidateId.trim().toUpperCase(),
    });
    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: `Candidate ID '${candidateId}' already exists.`,
      });
    }

    let photo = '';
    let symbol = '';

    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        symbol = `/uploads/${req.files.symbol[0].filename}`;
      }
    }

    const candidate = await Candidate.create({
      candidateName,
      candidateId: candidateId.trim().toUpperCase(),
      photo,
      symbol,
      description: description || '',
      department: department || '',
      postId,
      electionId,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private (Admin or Voter)
const getCandidates = async (req, res, next) => {
  try {
    const { electionId, postId, status } = req.query;
    const query = {};

    if (electionId) query.electionId = electionId;
    if (postId) query.postId = postId;
    if (status && status !== 'All') query.status = status;

    const candidates = await Candidate.find(query)
      .populate('postId', 'postName')
      .populate('electionId', 'electionName status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private (Admin or Voter)
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('postId', 'postName')
      .populate('electionId', 'electionName status');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const voteCount = await Vote.countDocuments({ candidateId: candidate._id });

    res.status(200).json({
      success: true,
      candidate,
      voteCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const { candidateName, description, department, postId, electionId, status } = req.body;

    if (candidateName) candidate.candidateName = candidateName;
    if (description !== undefined) candidate.description = description;
    if (department !== undefined) candidate.department = department;
    if (postId) candidate.postId = postId;
    if (electionId) candidate.electionId = electionId;
    if (status) candidate.status = status;

    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        candidate.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        candidate.symbol = `/uploads/${req.files.symbol[0].filename}`;
      }
    }

    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const votes = await Vote.countDocuments({ candidateId: candidate._id });
    if (votes > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete candidate: Votes have been cast for this candidate. Deactivate instead.',
      });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle candidate status
// @route   PATCH /api/candidates/:id/status
// @access  Private/Admin
const toggleCandidateStatus = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const newStatus = req.body.status || (candidate.status === 'Active' ? 'Inactive' : 'Active');
    candidate.status = newStatus;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: `Candidate status updated to ${newStatus}`,
      status: candidate.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  toggleCandidateStatus,
};

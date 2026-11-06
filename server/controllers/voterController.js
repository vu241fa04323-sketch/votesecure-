const Voter = require('../models/Voter');
const Participation = require('../models/Participation');
const bcrypt = require('bcryptjs');

// @desc    Create new voter (Admin only)
// @route   POST /api/voters
// @access  Private/Admin
const createVoter = async (req, res, next) => {
  try {
    const {
      fullName,
      userId,
      password,
      registrationNumber,
      email,
      mobileNumber,
      department,
      year,
      status,
    } = req.body;

    // Check duplicate userId
    const existingUserId = await Voter.findOne({ userId: userId.trim().toUpperCase() });
    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: `Voter with User ID '${userId}' already exists.`,
      });
    }

    // Check duplicate registrationNumber
    const existingReg = await Voter.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase(),
    });
    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: `Voter with Registration Number '${registrationNumber}' already exists.`,
      });
    }

    // Check duplicate email
    const existingEmail = await Voter.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Voter with Email '${email}' already exists.`,
      });
    }

    let profilePhoto = '';
    if (req.file) {
      profilePhoto = `/uploads/${req.file.filename}`;
    }

    const voter = await Voter.create({
      fullName,
      userId: userId.trim().toUpperCase(),
      password,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      mobileNumber,
      department,
      year,
      profilePhoto,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Voter account created successfully',
      voter: voter.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all voters with filtering, search and pagination
// @route   GET /api/voters
// @access  Private/Admin
const getVoters = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { userId: searchRegex },
        { registrationNumber: searchRegex },
        { email: searchRegex },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalVoters = await Voter.countDocuments(query);
    const voters = await Voter.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: voters.length,
      total: totalVoters,
      page: pageNum,
      pages: Math.ceil(totalVoters / limitNum),
      voters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single voter by ID
// @route   GET /api/voters/:id
// @access  Private/Admin
const getVoterById = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    // Also get their participation count
    const participationCount = await Participation.countDocuments({ voterId: voter._id });

    res.status(200).json({
      success: true,
      voter,
      participationCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update voter details
// @route   PUT /api/voters/:id
// @access  Private/Admin
const updateVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    const { fullName, email, mobileNumber, department, year, status } = req.body;

    if (fullName) voter.fullName = fullName;
    if (email) voter.email = email.trim().toLowerCase();
    if (mobileNumber) voter.mobileNumber = mobileNumber;
    if (department) voter.department = department;
    if (year) voter.year = year;
    if (status) voter.status = status;

    if (req.file) {
      voter.profilePhoto = `/uploads/${req.file.filename}`;
    }

    await voter.save();

    res.status(200).json({
      success: true,
      message: 'Voter details updated successfully',
      voter: voter.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete voter account
// @route   DELETE /api/voters/:id
// @access  Private/Admin
const deleteVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    // Check if voter has already participated in any election
    const hasVoted = await Participation.exists({ voterId: voter._id });
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete voter who has active voting records. Deactivate account instead.',
      });
    }

    await Voter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Voter account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate voter account
// @route   PATCH /api/voters/:id/status
// @access  Private/Admin
const toggleVoterStatus = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    const newStatus = req.body.status || (voter.status === 'Active' ? 'Inactive' : 'Active');
    voter.status = newStatus;
    await voter.save();

    res.status(200).json({
      success: true,
      message: `Voter account ${newStatus.toLowerCase()}d successfully`,
      status: voter.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset voter password (Admin only)
// @route   POST /api/voters/:id/reset-password
// @access  Private/Admin
const resetVoterPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    voter.password = newPassword;
    await voter.save();

    res.status(200).json({
      success: true,
      message: 'Voter password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVoter,
  getVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  toggleVoterStatus,
  resetVoterPassword,
};

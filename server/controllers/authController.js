const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const { generateToken } = require('../utils/tokenUtils');

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Administrator account not found.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken({ id: admin._id, role: 'admin' });

    res.status(200).json({
      success: true,
      message: 'Administrator logged in successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Voter login
// @route   POST /api/auth/voter/login
// @access  Public
const voterLogin = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const voter = await Voter.findOne({ userId: userId.trim().toUpperCase() }).select('+password');
    if (!voter) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Voter ID not found. Only administrators can issue voter accounts.',
      });
    }

    if (voter.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your voter account has been deactivated. Please contact the administrator.',
      });
    }

    const isMatch = await voter.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken({ id: voter._id, role: 'voter' });

    res.status(200).json({
      success: true,
      message: 'Voter logged in successfully',
      token,
      user: {
        id: voter._id,
        fullName: voter.fullName,
        userId: voter.userId,
        registrationNumber: voter.registrationNumber,
        email: voter.email,
        department: voter.department,
        year: voter.year,
        profilePhoto: voter.profilePhoto,
        status: voter.status,
        role: 'voter',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private (Admin or Voter)
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  voterLogin,
  getMe,
};

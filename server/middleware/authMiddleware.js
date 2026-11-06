const { verifyToken } = require('../utils/tokenUtils');
const Admin = require('../models/Admin');
const Voter = require('../models/Voter');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = verifyToken(token);

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or access revoked.',
        });
      }
      req.user = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      };
    } else if (decoded.role === 'voter') {
      const voter = await Voter.findById(decoded.id);
      if (!voter) {
        return res.status(401).json({
          success: false,
          message: 'Voter account not found or deactivated.',
        });
      }
      if (voter.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: 'Your voter account has been deactivated. Please contact the administrator.',
        });
      }
      req.user = {
        id: voter._id,
        fullName: voter.fullName,
        userId: voter.userId,
        registrationNumber: voter.registrationNumber,
        email: voter.email,
        department: voter.department,
        year: voter.year,
        status: voter.status,
        role: 'voter',
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role in token authorization.',
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required.',
  });
};

const isVoter = (req, res, next) => {
  if (req.user && req.user.role === 'voter') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Voter privileges required.',
  });
};

module.exports = {
  authenticate,
  isAdmin,
  isVoter,
};

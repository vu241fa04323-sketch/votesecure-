const { validationResult, body } = require('express-validator');

// Generic result validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const adminLoginRules = [
  body('email').isEmail().withMessage('Valid email address is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const voterLoginRules = [
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const addVoterRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isAlphanumeric()
    .withMessage('User ID must be alphanumeric'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm password does not match password');
    }
    return true;
  }),
  body('registrationNumber').trim().notEmpty().withMessage('Registration Number / Voter ID is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('year').trim().notEmpty().withMessage('Year / Class is required'),
];

const editVoterRules = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobileNumber').optional().trim().notEmpty().withMessage('Mobile number cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('year').optional().trim().notEmpty().withMessage('Year cannot be empty'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

const electionRules = [
  body('electionName').trim().notEmpty().withMessage('Election name is required'),
  body('description').trim().notEmpty().withMessage('Election description is required'),
  body('startDate').isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate').isISO8601().withMessage('End date must be in YYYY-MM-DD format'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be HH:mm (24h)'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be HH:mm (24h)'),
  body('status').optional().isIn(['Upcoming', 'Active', 'Completed']).withMessage('Invalid status'),
];

const postRules = [
  body('postName').trim().notEmpty().withMessage('Post / Position name is required'),
  body('electionId').isMongoId().withMessage('Valid election ID is required'),
];

const candidateRules = [
  body('candidateName').trim().notEmpty().withMessage('Candidate name is required'),
  body('candidateId').trim().notEmpty().withMessage('Candidate ID is required'),
  body('postId').isMongoId().withMessage('Valid post ID is required'),
  body('electionId').isMongoId().withMessage('Valid election ID is required'),
];

const castVoteRules = [
  body('electionId').isMongoId().withMessage('Valid election ID is required'),
  body('postId').isMongoId().withMessage('Valid post ID is required'),
  body('candidateId').isMongoId().withMessage('Valid candidate ID is required'),
];

module.exports = {
  validate,
  adminLoginRules,
  voterLoginRules,
  addVoterRules,
  editVoterRules,
  electionRules,
  postRules,
  candidateRules,
  castVoteRules,
};

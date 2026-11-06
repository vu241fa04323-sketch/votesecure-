const express = require('express');
const router = express.Router();
const {
  createVoter,
  getVoters,
  getVoterById,
  updateVoter,
  deleteVoter,
  toggleVoterStatus,
  resetVoterPassword,
} = require('../controllers/voterController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  addVoterRules,
  editVoterRules,
  validate,
} = require('../middleware/validationMiddleware');

// All voter management routes require Admin authorization
router.use(authenticate, isAdmin);

router.route('/')
  .post(upload.single('profilePhoto'), addVoterRules, validate, createVoter)
  .get(getVoters);

router.route('/:id')
  .get(getVoterById)
  .put(upload.single('profilePhoto'), editVoterRules, validate, updateVoter)
  .delete(deleteVoter);

router.patch('/:id/status', toggleVoterStatus);
router.post('/:id/reset-password', resetVoterPassword);

module.exports = router;

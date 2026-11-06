const express = require('express');
const router = express.Router();
const {
  castVote,
  getVoterStatus,
  getAvailableElections,
} = require('../controllers/voteController');
const { authenticate, isVoter } = require('../middleware/authMiddleware');
const { castVoteRules, validate } = require('../middleware/validationMiddleware');

router.use(authenticate, isVoter);

router.post('/cast', castVoteRules, validate, castVote);
router.get('/status', getVoterStatus);
router.get('/available', getAvailableElections);

module.exports = router;

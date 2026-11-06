const express = require('express');
const router = express.Router();
const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  updateElectionStatus,
} = require('../controllers/electionController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { electionRules, validate } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.route('/')
  .post(isAdmin, electionRules, validate, createElection)
  .get(getElections);

router.route('/:id')
  .get(getElectionById)
  .put(isAdmin, electionRules, validate, updateElection)
  .delete(isAdmin, deleteElection);

router.patch('/:id/status', isAdmin, updateElectionStatus);

module.exports = router;

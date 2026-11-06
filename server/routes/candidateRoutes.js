const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  toggleCandidateStatus,
} = require('../controllers/candidateController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { candidateRules, validate } = require('../middleware/validationMiddleware');

router.use(authenticate);

const candidateUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'symbol', maxCount: 1 },
]);

router.route('/')
  .post(isAdmin, candidateUpload, candidateRules, validate, createCandidate)
  .get(getCandidates);

router.route('/:id')
  .get(getCandidateById)
  .put(isAdmin, candidateUpload, updateCandidate)
  .delete(isAdmin, deleteCandidate);

router.patch('/:id/status', isAdmin, toggleCandidateStatus);

module.exports = router;

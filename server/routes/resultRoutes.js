const express = require('express');
const router = express.Router();
const {
  getElectionResults,
  getPostResults,
  exportElectionResultsCSV,
  getAdminDashboardSummary,
} = require('../controllers/resultController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

// Admin dashboard summary statistics
router.get('/admin/summary', isAdmin, getAdminDashboardSummary);

// Results export (Admin only)
router.get('/:electionId/export', isAdmin, exportElectionResultsCSV);

// Single post results
router.get('/:electionId/:postId', getPostResults);

// Full election results
router.get('/:electionId', getElectionResults);

module.exports = router;

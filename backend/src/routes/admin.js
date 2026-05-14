const express = require('express');
const router = express.Router();
const {
  getAdminStats, getAdminUsers, blockUser, verifyEmployer, blockJob,
  getAdminReports, updateReportStatus,
} = require('../controllers/otherControllers');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('ADMIN'), getAdminStats);
router.get('/users', authenticate, authorize('ADMIN'), getAdminUsers);
router.put('/users/:id/block', authenticate, authorize('ADMIN'), blockUser);
router.put('/users/:id/verify', authenticate, authorize('ADMIN'), verifyEmployer);
router.put('/jobs/:id/block', authenticate, authorize('ADMIN'), blockJob);
router.get('/reports', authenticate, authorize('ADMIN'), getAdminReports);
router.put('/reports/:id/status', authenticate, authorize('ADMIN'), updateReportStatus);

module.exports = router;

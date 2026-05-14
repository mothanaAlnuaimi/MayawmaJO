const express = require('express');
const router = express.Router();
const { getMyApplications, getEmployerApplications, updateApplicationStatus } = require('../controllers/applicationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my', authenticate, authorize('JOB_SEEKER'), getMyApplications);
router.get('/employer', authenticate, authorize('EMPLOYER'), getEmployerApplications);
router.put('/:id/status', authenticate, authorize('EMPLOYER'), updateApplicationStatus);

module.exports = router;

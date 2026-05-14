const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob, getEmployerJobs } = require('../controllers/jobsController');
const { applyToJob } = require('../controllers/applicationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/my', authenticate, authorize('EMPLOYER'), getEmployerJobs);
router.get('/:id', getJobById);
router.post('/', authenticate, authorize('EMPLOYER'), createJob);
router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);
router.post('/:id/apply', authenticate, authorize('JOB_SEEKER'), applyToJob);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getRecommendedJobs, getProfileSuggestions, getUserTrustScore } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.get('/recommended-jobs', authenticate, getRecommendedJobs);
router.post('/profile-suggestions', authenticate, getProfileSuggestions);
router.get('/trust-score/:userId', authenticate, getUserTrustScore);

module.exports = router;

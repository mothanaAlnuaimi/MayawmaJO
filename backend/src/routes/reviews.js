const express = require('express');
const router = express.Router();
const { createReview, getUserReviews } = require('../controllers/otherControllers');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createReview);
router.get('/user/:id', getUserReviews);

module.exports = router;

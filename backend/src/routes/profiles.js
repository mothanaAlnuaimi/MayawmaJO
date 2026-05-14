const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getUserProfile } = require('../controllers/profilesController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);
router.get('/user/:id', getUserProfile);

module.exports = router;

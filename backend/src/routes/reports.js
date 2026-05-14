const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/otherControllers');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createReport);

module.exports = router;

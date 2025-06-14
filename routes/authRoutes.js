const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Exchange authorization code for tokens
router.post('/google', authController.exchangeCodeForTokens);

// Refresh access token
router.post('/refresh', authController.refreshToken);

// Get OAuth URL for frontend
router.get('/google/url', authController.getAuthUrl);

module.exports = router;
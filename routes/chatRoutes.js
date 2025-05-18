const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Chat API endpoint
router.post('/chat', chatController.processChat);

// Save conversation endpoint
router.post('/conversations', chatController.saveConversation);

module.exports = router;
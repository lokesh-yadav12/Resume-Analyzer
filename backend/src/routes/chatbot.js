const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');

// All routes require authentication
router.use(authenticate);

// Get chatbot response
router.post('/message', chatbotController.getChatResponse);

// Get conversation history
router.get('/history', chatbotController.getConversationHistory);

module.exports = router;

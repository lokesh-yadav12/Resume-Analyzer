const express = require('express');
const {
  chatWithCareerAdvisor,
  getConversationHistory,
  getUserConversations,
  deleteConversation
} = require('../controllers/chatController');
const { authenticate, userRateLimit } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for chat operations
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Apply authentication to all routes
router.use(authenticate);

// Chat with career advisor
router.post('/career-advisor', 
  chatLimiter,
  userRateLimit(20, 60 * 1000), // 20 messages per minute per user
  chatWithCareerAdvisor
);

// Conversation management
router.get('/conversations', getUserConversations);
router.get('/conversations/:conversationId', getConversationHistory);
router.delete('/conversations/:conversationId', deleteConversation);

module.exports = router;
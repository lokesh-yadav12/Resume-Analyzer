const express = require('express');
const {
  getSkillGapAnalysis,
  getTrendingSkills,
  getSkillDatabase
} = require('../controllers/skillController');
const { authenticate, userRateLimit } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for skill analysis
const skillAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Too many skill analysis requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Public routes
router.get('/trending', getTrendingSkills);
router.get('/database', getSkillDatabase);

// Protected routes (authentication required)
router.use(authenticate);

// Skill gap analysis (requires authentication and resume)
router.get('/gap-analysis', 
  skillAnalysisLimiter,
  userRateLimit(5, 60 * 1000), // 5 per minute per user
  getSkillGapAnalysis
);

module.exports = router;
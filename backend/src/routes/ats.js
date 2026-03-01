const express = require('express');
const {
  calculateATSScore,
  calculateATSScoreForText,
  getATSImprovementSuggestions,
  compareATSScores,
  getATSScoreHistory,
  getGradeInfo
} = require('../controllers/atsController');
const { authenticate, requireEmailVerification, userRateLimit } = require('../middleware/auth');
const { validateATSCalculation, validateATSTextCalculation, validateATSComparison } = require('../middleware/validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for ATS calculations
const atsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 calculations per hour per user
  message: {
    success: false,
    message: 'Too many ATS calculations. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Apply authentication to all routes
router.use(authenticate);

// Calculate ATS score for existing resume
router.post('/calculate/:resumeId',
  requireEmailVerification,
  atsLimiter,
  userRateLimit(10, 60 * 60 * 1000), // 10 calculations per hour per user
  validateATSCalculation,
  calculateATSScore
);

// Calculate ATS score for text input (without saving)
router.post('/calculate-text',
  requireEmailVerification,
  atsLimiter,
  validateATSTextCalculation,
  calculateATSScoreForText
);

// Get ATS improvement suggestions for a resume
router.get('/suggestions/:resumeId',
  getATSImprovementSuggestions
);

// Compare ATS scores between multiple resumes
router.post('/compare',
  validateATSComparison,
  compareATSScores
);

// Get ATS score history for the user
router.get('/history',
  getATSScoreHistory
);

// Get grade information and scoring criteria
router.get('/grade-info',
  getGradeInfo
);

module.exports = router;
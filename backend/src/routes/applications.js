const express = require('express');
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  scheduleInterview,
  updateInterview,
  addFollowUp,
  completeFollowUp,
  getApplicationStats,
  getUpcomingInterviews
} = require('../controllers/applicationController');
const { authenticate, userRateLimit } = require('../middleware/auth');
const { validateJobApplication } = require('../middleware/validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for application operations
const applicationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    message: 'Too many application requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Apply authentication to all routes
router.use(authenticate);

// Application CRUD operations
router.post('/', 
  applicationLimiter,
  userRateLimit(10, 60 * 1000), // 10 applications per minute per user
  validateJobApplication,
  createApplication
);

router.get('/', getApplications);
router.get('/stats', getApplicationStats);
router.get('/interviews/upcoming', getUpcomingInterviews);
router.get('/:id', getApplicationById);

router.put('/:id', 
  applicationLimiter,
  updateApplication
);

router.delete('/:id', deleteApplication);

// Interview management
router.post('/:id/interviews', 
  applicationLimiter,
  scheduleInterview
);

router.put('/:id/interviews/:interviewId', 
  applicationLimiter,
  updateInterview
);

// Follow-up management
router.post('/:id/followups', 
  applicationLimiter,
  addFollowUp
);

router.put('/:id/followups/:followUpId/complete', 
  applicationLimiter,
  completeFollowUp
);

module.exports = router;
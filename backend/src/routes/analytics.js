const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticate);

// Get user analytics
router.get('/', analyticsController.getUserAnalytics);

// Get skill trends
router.get('/skill-trends', analyticsController.getSkillTrends);

module.exports = router;

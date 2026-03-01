const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const learningController = require('../controllers/learningController');

// All routes require authentication
router.use(authenticate);

// Get skill gap analysis
router.get('/skill-gaps', learningController.getSkillGapAnalysis);

// Get learning recommendations
router.get('/recommendations', learningController.getLearningRecommendations);

module.exports = router;

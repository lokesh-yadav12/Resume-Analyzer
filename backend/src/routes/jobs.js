const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const jobController = require('../controllers/jobController');

// All routes require authentication
router.use(authenticate);

// Get personalized job recommendations
router.get('/recommendations', jobController.getRecommendations);

// Search jobs
router.get('/search', jobController.searchJobs);

// Get job details
router.get('/:id', jobController.getJobDetails);

// Save/unsave job
router.post('/:jobId/save', jobController.saveJob);
router.delete('/:jobId/save', jobController.unsaveJob);

// Get saved jobs
router.get('/saved/list', jobController.getSavedJobs);

module.exports = router;

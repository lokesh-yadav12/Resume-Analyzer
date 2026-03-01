const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const resumeController = require('../controllers/resumeController');

// All routes require authentication
router.use(authenticate);

// Upload resume
router.post(
  '/upload',
  upload.single('resume'),
  handleUploadError,
  resumeController.uploadResume
);

// Get all user resumes
router.get('/', resumeController.getUserResumes);

// Get specific resume analysis
router.get('/:id', resumeController.getResumeAnalysis);

// Get ATS score for resume
router.get('/:id/ats-score', resumeController.getATSScore);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;

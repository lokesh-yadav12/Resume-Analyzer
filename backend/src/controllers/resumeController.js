const Resume = require('../models/Resume');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Upload and analyze resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const userId = req.user._id;
    const file = req.file;
    
    // Demo mode - return mock data
    if (process.env.DEMO_MODE === 'true') {
      return res.status(201).json({
        success: true,
        data: {
          resumeId: 'demo-resume-' + Date.now(),
          fileName: file.originalname,
          fileSize: file.size,
          extractedText: 'Sample resume text extracted...',
          analysis: {
            atsScore: {
              totalScore: 85,
              breakdown: {
                keywordMatch: 35,
                contactInfo: 15,
                structure: 18,
                formatting: 12,
                quantifiable: 5
              },
              grade: 'A',
              suggestions: [
                { category: 'Keywords', message: 'Add more industry-specific keywords', priority: 'medium' },
                { category: 'Achievements', message: 'Include more quantifiable achievements', priority: 'high' }
              ]
            },
            skills: {
              technical: [
                { name: 'React', category: 'Web', proficiency: 'Advanced', yearsExperience: 3, confidence: 0.9 },
                { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate', yearsExperience: 2, confidence: 0.8 },
                { name: 'Python', category: 'Programming', proficiency: 'Advanced', yearsExperience: 4, confidence: 0.85 }
              ],
              soft: [
                { name: 'Leadership', evidence: ['Led team of 5 developers'], confidence: 0.9 },
                { name: 'Communication', evidence: ['Presented to stakeholders'], confidence: 0.85 }
              ],
              certifications: [
                { name: 'AWS Certified', issuer: 'Amazon Web Services', dateObtained: '2023' }
              ]
            }
          },
          message: 'Resume uploaded successfully (Demo Mode)'
        }
      });
    }

    // Extract text from file using ML service
    let extractedText = '';
    try {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(file.path);
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, file.originalname);

      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/extract-text`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      extractedText = mlResponse.data.text || '';
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      // Fallback: use basic text extraction or empty string
      extractedText = 'Text extraction temporarily unavailable';
    }

    // Create resume record
    const resume = new Resume({
      userId,
      originalFileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      extractedText,
      analysis: {
        atsScore: {
          totalScore: 0,
          breakdown: {},
          grade: 'Pending',
          suggestions: []
        },
        skills: {
          technical: [],
          soft: [],
          certifications: []
        },
        experience: {
          totalYears: 0,
          positions: []
        },
        education: []
      }
    });

    await resume.save();

    // Trigger async analysis
    analyzeResumeAsync(resume._id).catch(err => 
      console.error('Async analysis error:', err)
    );

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume._id,
        fileName: file.originalname,
        fileSize: file.size,
        extractedText: extractedText.substring(0, 500) + '...',
        message: 'Resume uploaded successfully. Analysis in progress...'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if upload failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('File cleanup error:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload resume'
    });
  }
};

// Async analysis function
async function analyzeResumeAsync(resumeId) {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Call ML service for ATS scoring
    try {
      const atsResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/analyze-ats`,
        { text: resume.extractedText },
        { timeout: 60000 }
      );

      resume.analysis.atsScore = atsResponse.data.atsScore || resume.analysis.atsScore;
    } catch (error) {
      console.error('ATS analysis error:', error.message);
    }

    // Call ML service for skill extraction
    try {
      const skillsResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/extract-skills`,
        { text: resume.extractedText },
        { timeout: 60000 }
      );

      resume.analysis.skills = skillsResponse.data.skills || resume.analysis.skills;
    } catch (error) {
      console.error('Skills extraction error:', error.message);
    }

    resume.analysisStatus = 'completed';
    await resume.save();
  } catch (error) {
    console.error('Async analysis error:', error);
  }
}

// Get resume analysis
exports.getResumeAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve resume'
    });
  }
};

// Get all user resumes
exports.getUserResumes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const resumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-extractedText');

    const count = await Resume.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        resumes,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve resumes'
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume'
    });
  }
};

// Get ATS score
exports.getATSScore = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: {
        atsScore: resume.analysis.atsScore,
        analysisStatus: resume.analysisStatus
      }
    });
  } catch (error) {
    console.error('Get ATS score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ATS score'
    });
  }
};

module.exports = exports;

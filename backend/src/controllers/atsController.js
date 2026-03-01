const Resume = require('../models/Resume');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

// Calculate ATS score for existing resume
const calculateATSScore = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobKeywords } = req.body;
    const userId = req.user._id;
    
    // Find the resume
    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text not available. Please reprocess the resume.'
      });
    }
    
    try {
      // Send to ML service for ATS calculation
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/calculate-ats`,
        {
          text: resume.extractedText,
          job_keywords: jobKeywords || []
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const atsScore = mlResponse.data.ats_score;
      
      // Update resume with new ATS score if it's different
      if (resume.analysis?.atsScore?.totalScore !== atsScore.totalScore) {
        resume.analysis = resume.analysis || {};
        resume.analysis.atsScore = atsScore;
        await resume.save();
      }
      
      res.json({
        success: true,
        data: {
          resumeId: resume._id,
          atsScore: atsScore,
          calculatedAt: new Date().toISOString(),
          jobKeywords: jobKeywords || []
        }
      });
      
    } catch (mlError) {
      console.error('ML service error:', mlError);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate ATS score. Please try again.'
      });
    }
    
  } catch (error) {
    console.error('Calculate ATS score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ATS score'
    });
  }
};

// Calculate ATS score for text input (without saving)
const calculateATSScoreForText = async (req, res) => {
  try {
    const { text, jobKeywords } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Text is too short for ATS analysis (minimum 50 characters)'
      });
    }
    
    try {
      // Send to ML service for ATS calculation
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/calculate-ats`,
        {
          text: text,
          job_keywords: jobKeywords || []
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const atsScore = mlResponse.data.ats_score;
      
      res.json({
        success: true,
        data: {
          atsScore: atsScore,
          calculatedAt: new Date().toISOString(),
          jobKeywords: jobKeywords || [],
          textLength: text.length,
          wordCount: text.split(/\s+/).length
        }
      });
      
    } catch (mlError) {
      console.error('ML service error:', mlError);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate ATS score. Please try again.'
      });
    }
    
  } catch (error) {
    console.error('Calculate ATS score for text error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ATS score'
    });
  }
};

// Get ATS improvement suggestions
const getATSImprovementSuggestions = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user._id;
    
    // Find the resume
    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    if (!resume.analysis?.atsScore) {
      return res.status(400).json({
        success: false,
        message: 'ATS score not available. Please analyze the resume first.'
      });
    }
    
    const atsScore = resume.analysis.atsScore;
    const suggestions = generateDetailedSuggestions(atsScore, resume.extractedText);
    
    res.json({
      success: true,
      data: {
        resumeId: resume._id,
        currentScore: atsScore.totalScore,
        currentGrade: atsScore.grade,
        suggestions: suggestions,
        breakdown: atsScore.breakdown,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Get ATS improvement suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get improvement suggestions'
    });
  }
};

// Compare ATS scores between resumes
const compareATSScores = async (req, res) => {
  try {
    const { resumeIds } = req.body;
    const userId = req.user._id;
    
    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 resume IDs for comparison'
      });
    }
    
    if (resumeIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 resumes can be compared at once'
      });
    }
    
    // Find all resumes
    const resumes = await Resume.find({
      _id: { $in: resumeIds },
      userId: userId
    }).select('originalFileName analysis.atsScore createdAt');
    
    if (resumes.length !== resumeIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more resumes not found'
      });
    }
    
    // Prepare comparison data
    const comparison = resumes.map(resume => ({
      resumeId: resume._id,
      fileName: resume.originalFileName,
      atsScore: resume.analysis?.atsScore?.totalScore || 0,
      grade: resume.analysis?.atsScore?.grade || 'N/A',
      breakdown: resume.analysis?.atsScore?.breakdown || {},
      createdAt: resume.createdAt
    }));
    
    // Sort by ATS score (highest first)
    comparison.sort((a, b) => b.atsScore - a.atsScore);
    
    // Calculate insights
    const scores = comparison.map(c => c.atsScore);
    const insights = {
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      scoreRange: Math.max(...scores) - Math.min(...scores),
      improvementPotential: 100 - Math.max(...scores)
    };
    
    res.json({
      success: true,
      data: {
        comparison: comparison,
        insights: insights,
        comparedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Compare ATS scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare ATS scores'
    });
  }
};

// Get ATS score history for a user
const getATSScoreHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const resumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('originalFileName analysis.atsScore createdAt updatedAt');
    
    const history = resumes
      .filter(resume => resume.analysis?.atsScore)
      .map(resume => ({
        resumeId: resume._id,
        fileName: resume.originalFileName,
        atsScore: resume.analysis.atsScore.totalScore,
        grade: resume.analysis.atsScore.grade,
        createdAt: resume.createdAt,
        lastUpdated: resume.updatedAt
      }));
    
    // Calculate trend
    let trend = 'stable';
    if (history.length >= 2) {
      const latest = history[0].atsScore;
      const previous = history[1].atsScore;
      const difference = latest - previous;
      
      if (difference > 5) trend = 'improving';
      else if (difference < -5) trend = 'declining';
    }
    
    const total = await Resume.countDocuments({ 
      userId,
      'analysis.atsScore': { $exists: true }
    });
    
    res.json({
      success: true,
      data: {
        history: history,
        trend: trend,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get ATS score history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ATS score history'
    });
  }
};

// Generate grade assignment based on score
const getGradeInfo = (req, res) => {
  try {
    const gradeInfo = {
      'A+': {
        range: '90-100',
        description: 'Excellent ATS compatibility',
        color: '#22c55e',
        recommendations: ['Your resume is highly optimized for ATS systems', 'Focus on tailoring keywords for specific jobs']
      },
      'A': {
        range: '85-89',
        description: 'Very good ATS compatibility',
        color: '#16a34a',
        recommendations: ['Add a few more quantifiable achievements', 'Consider minor keyword optimization']
      },
      'B': {
        range: '75-84',
        description: 'Good ATS compatibility',
        color: '#eab308',
        recommendations: ['Improve section structure and formatting', 'Add more relevant keywords and achievements']
      },
      'C': {
        range: '65-74',
        description: 'Fair ATS compatibility',
        color: '#f59e0b',
        recommendations: ['Significant improvements needed in multiple areas', 'Focus on contact info, keywords, and structure']
      },
      'D': {
        range: '0-64',
        description: 'Poor ATS compatibility',
        color: '#ef4444',
        recommendations: ['Major overhaul needed', 'Start with basic structure and contact information']
      }
    };
    
    res.json({
      success: true,
      data: {
        gradeInfo: gradeInfo,
        scoringCriteria: {
          keywordMatch: { max: 40, description: 'Relevance to job requirements' },
          contactInfo: { max: 15, description: 'Complete contact information' },
          structure: { max: 20, description: 'Clear sections and organization' },
          formatting: { max: 15, description: 'Professional formatting and length' },
          quantifiable: { max: 10, description: 'Measurable achievements' }
        }
      }
    });
    
  } catch (error) {
    console.error('Get grade info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grade information'
    });
  }
};

// Helper function to generate detailed suggestions
const generateDetailedSuggestions = (atsScore, resumeText) => {
  const suggestions = [];
  const breakdown = atsScore.breakdown;
  
  // Keyword suggestions
  if (breakdown.keywordMatch < 30) {
    suggestions.push({
      category: 'Keywords',
      priority: 'high',
      issue: 'Low keyword relevance',
      suggestion: 'Include more industry-specific keywords and action verbs from job descriptions',
      impact: 'Could improve score by 10-15 points',
      examples: ['Use terms like "developed", "implemented", "managed"', 'Include technical skills mentioned in job postings']
    });
  }
  
  // Contact info suggestions
  if (breakdown.contactInfo < 15) {
    const missing = [];
    if (breakdown.contactInfo < 5) missing.push('professional email');
    if (breakdown.contactInfo < 10) missing.push('phone number');
    if (breakdown.contactInfo < 15) missing.push('LinkedIn profile');
    
    suggestions.push({
      category: 'Contact Information',
      priority: 'high',
      issue: `Missing: ${missing.join(', ')}`,
      suggestion: 'Add complete contact information at the top of your resume',
      impact: 'Could improve score by 5-15 points',
      examples: ['john.doe@email.com', '(555) 123-4567', 'linkedin.com/in/johndoe']
    });
  }
  
  // Structure suggestions
  if (breakdown.structure < 15) {
    suggestions.push({
      category: 'Structure',
      priority: 'medium',
      issue: 'Poor section organization',
      suggestion: 'Use clear section headers and bullet points for better readability',
      impact: 'Could improve score by 5-10 points',
      examples: ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'Use • bullet points']
    });
  }
  
  // Formatting suggestions
  if (breakdown.formatting < 10) {
    suggestions.push({
      category: 'Formatting',
      priority: 'medium',
      issue: 'Formatting needs improvement',
      suggestion: 'Optimize resume length and use consistent formatting',
      impact: 'Could improve score by 3-8 points',
      examples: ['Keep resume to 1-2 pages', 'Use consistent font and spacing', 'Avoid excessive capitalization']
    });
  }
  
  // Quantifiable achievements suggestions
  if (breakdown.quantifiable < 7) {
    suggestions.push({
      category: 'Achievements',
      priority: 'high',
      issue: 'Lack of measurable accomplishments',
      suggestion: 'Add specific numbers, percentages, and measurable results',
      impact: 'Could improve score by 5-10 points',
      examples: ['Increased sales by 25%', 'Managed team of 8 developers', 'Reduced costs by $50K annually']
    });
  }
  
  return suggestions;
};

module.exports = {
  calculateATSScore,
  calculateATSScoreForText,
  getATSImprovementSuggestions,
  compareATSScores,
  getATSScoreHistory,
  getGradeInfo
};
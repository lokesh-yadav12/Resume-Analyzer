const Resume = require('../models/Resume');

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all user resumes
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    if (resumes.length === 0) {
      return res.json({
        success: true,
        data: {
          profileStrength: 0,
          skillsCount: 0,
          atsScoreHistory: [],
          skillDistribution: {},
          recommendations: []
        }
      });
    }

    const latestResume = resumes[0];

    // Calculate profile strength
    const profileStrength = calculateProfileStrength(latestResume);

    // Get skills count
    const skillsCount = {
      technical: latestResume.analysis.skills.technical.length,
      soft: latestResume.analysis.skills.soft.length,
      certifications: latestResume.analysis.skills.certifications.length,
      total: latestResume.analysis.skills.technical.length + 
             latestResume.analysis.skills.soft.length +
             latestResume.analysis.skills.certifications.length
    };

    // ATS score history
    const atsScoreHistory = resumes.map(resume => ({
      date: resume.createdAt,
      score: resume.analysis.atsScore.totalScore,
      grade: resume.analysis.atsScore.grade
    }));

    // Skill distribution
    const skillDistribution = {};
    latestResume.analysis.skills.technical.forEach(skill => {
      const category = skill.category || 'Other';
      skillDistribution[category] = (skillDistribution[category] || 0) + 1;
    });

    // Generate recommendations
    const recommendations = generateRecommendations(latestResume);

    res.json({
      success: true,
      data: {
        profileStrength,
        skillsCount,
        atsScoreHistory,
        skillDistribution,
        experienceYears: latestResume.analysis.experience.totalYears,
        recommendations
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
};

// Get skill trends
exports.getSkillTrends = async (req, res) => {
  try {
    const userId = req.user._id;

    const resumes = await Resume.find({ userId }).sort({ createdAt: 1 });

    const trends = resumes.map(resume => ({
      date: resume.createdAt,
      technicalSkills: resume.analysis.skills.technical.length,
      softSkills: resume.analysis.skills.soft.length,
      certifications: resume.analysis.skills.certifications.length
    }));

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Skill trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skill trends'
    });
  }
};

function calculateProfileStrength(resume) {
  let score = 0;

  // ATS score (40 points)
  score += (resume.analysis.atsScore.totalScore / 100) * 40;

  // Skills (30 points)
  const totalSkills = resume.analysis.skills.technical.length + 
                     resume.analysis.skills.soft.length;
  score += Math.min(30, (totalSkills / 20) * 30);

  // Experience (20 points)
  const years = resume.analysis.experience.totalYears;
  score += Math.min(20, (years / 10) * 20);

  // Certifications (10 points)
  const certs = resume.analysis.skills.certifications.length;
  score += Math.min(10, certs * 2);

  return Math.round(score);
}

function generateRecommendations(resume) {
  const recommendations = [];

  // ATS score recommendations
  if (resume.analysis.atsScore.totalScore < 70) {
    recommendations.push({
      type: 'ats',
      priority: 'high',
      message: 'Improve your ATS score by adding more relevant keywords and quantifiable achievements'
    });
  }

  // Skills recommendations
  if (resume.analysis.skills.technical.length < 10) {
    recommendations.push({
      type: 'skills',
      priority: 'medium',
      message: 'Add more technical skills to your resume to increase job matches'
    });
  }

  // Certifications
  if (resume.analysis.skills.certifications.length === 0) {
    recommendations.push({
      type: 'certifications',
      priority: 'medium',
      message: 'Consider adding professional certifications to boost your profile'
    });
  }

  return recommendations;
}

module.exports = exports;

const Resume = require('../models/Resume');

// Sample course database
const coursesDatabase = [
  {
    id: 'react-1',
    title: 'Complete React Developer Course',
    platform: 'Udemy',
    skill: 'React',
    difficulty: 'Intermediate',
    duration: '40 hours',
    price: 89.99,
    rating: 4.7,
    url: 'https://udemy.com/react-course'
  },
  {
    id: 'python-1',
    title: 'Python for Data Science',
    platform: 'Coursera',
    skill: 'Python',
    difficulty: 'Beginner',
    duration: '30 hours',
    price: 0,
    rating: 4.8,
    url: 'https://coursera.org/python'
  },
  {
    id: 'aws-1',
    title: 'AWS Certified Solutions Architect',
    platform: 'A Cloud Guru',
    skill: 'AWS',
    difficulty: 'Advanced',
    duration: '50 hours',
    price: 299,
    rating: 4.9,
    url: 'https://acloudguru.com/aws'
  }
];

// Get skill gap analysis
exports.getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.query;

    // Get user's latest resume
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'No resume found'
      });
    }

    // Get user skills
    const userSkills = resume.analysis.skills.technical.map(s => s.name.toLowerCase());

    // Sample target job skills (in real app, fetch from Job model)
    const targetSkills = ['react', 'node.js', 'mongodb', 'aws', 'docker', 'kubernetes'];

    // Calculate gaps
    const missingSkills = targetSkills.filter(skill => 
      !userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );

    const matchedSkills = targetSkills.filter(skill =>
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );

    res.json({
      success: true,
      data: {
        userSkills,
        targetSkills,
        matchedSkills,
        missingSkills,
        matchPercentage: (matchedSkills.length / targetSkills.length) * 100
      }
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze skill gaps'
    });
  }
};

// Get learning recommendations
exports.getLearningRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's latest resume
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'No resume found'
      });
    }

    // Get user skills
    const userSkills = resume.analysis.skills.technical.map(s => s.name.toLowerCase());

    // Recommend courses for missing/weak skills
    const recommendations = coursesDatabase.map(course => ({
      ...course,
      relevance: userSkills.includes(course.skill.toLowerCase()) ? 'strengthen' : 'learn',
      estimatedImpact: Math.floor(Math.random() * 30) + 10 // 10-40% impact
    }));

    res.json({
      success: true,
      data: {
        courses: recommendations,
        learningPath: generateLearningPath(recommendations)
      }
    });
  } catch (error) {
    console.error('Learning recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get learning recommendations'
    });
  }
};

function generateLearningPath(courses) {
  return {
    beginner: courses.filter(c => c.difficulty === 'Beginner'),
    intermediate: courses.filter(c => c.difficulty === 'Intermediate'),
    advanced: courses.filter(c => c.difficulty === 'Advanced'),
    timeline: {
      '3months': courses.slice(0, 2),
      '6months': courses.slice(0, 4),
      '12months': courses
    }
  };
}

module.exports = exports;

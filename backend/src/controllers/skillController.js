const Resume = require('../models/Resume');
const Job = require('../models/Job');
const axios = require('axios');

// Get skill gap analysis for user
const getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeId, targetJobIds } = req.query;

    // Get user's latest resume or specified resume
    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId });
    } else {
      resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    }

    if (!resume || !resume.analysis?.skills) {
      return res.status(400).json({
        success: false,
        message: 'No resume analysis found. Please upload and analyze a resume first.'
      });
    }

    // Get target jobs for comparison
    let targetJobs = [];
    if (targetJobIds) {
      const jobIds = Array.isArray(targetJobIds) ? targetJobIds : [targetJobIds];
      targetJobs = await Job.find({ _id: { $in: jobIds }, isActive: true });
    } else {
      // Get recommended jobs if no specific targets
      targetJobs = await Job.find({ isActive: true })
        .sort({ qualityScore: -1, postedDate: -1 })
        .limit(10);
    }

    // Extract user skills
    const userSkills = resume.analysis.skills;
    const userTechnicalSkills = userSkills.technical || [];
    const userSoftSkills = userSkills.soft || [];

    // Analyze skill gaps
    const skillGapAnalysis = analyzeSkillGaps(userTechnicalSkills, userSoftSkills, targetJobs);

    // Get trending skills in user's industry
    const trendingSkills = await getTrendingSkills(resume.analysis);

    // Generate learning recommendations
    const learningRecommendations = generateLearningRecommendations(
      skillGapAnalysis.missingSkills,
      userTechnicalSkills
    );

    res.json({
      success: true,
      data: {
        userSkills: {
          technical: userTechnicalSkills,
          soft: userSoftSkills,
          totalCount: userTechnicalSkills.length + userSoftSkills.length
        },
        skillGapAnalysis,
        trendingSkills,
        learningRecommendations,
        resumeUsed: {
          id: resume._id,
          fileName: resume.originalFileName,
          analyzedAt: resume.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze skill gaps'
    });
  }
};

// Get trending skills in industry
const getTrendingSkills = async (req, res) => {
  try {
    const { industry, experienceLevel } = req.query;

    // Get skills from recent job postings
    const recentJobs = await Job.find({
      isActive: true,
      postedDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
      ...(industry && { 'company.industry': new RegExp(industry, 'i') }),
      ...(experienceLevel && { 'requirements.experience.level': experienceLevel })
    }).limit(100);

    const skillFrequency = {};
    const skillTrends = {};

    recentJobs.forEach(job => {
      const jobSkills = job.requirements?.skills || [];
      jobSkills.forEach(skill => {
        const skillName = skill.name.toLowerCase();
        skillFrequency[skillName] = (skillFrequency[skillName] || 0) + 1;
        
        if (!skillTrends[skillName]) {
          skillTrends[skillName] = {
            name: skill.name,
            category: skill.category,
            frequency: 0,
            demandLevel: 'Low',
            salaryImpact: 'Neutral',
            growthRate: 0
          };
        }
        skillTrends[skillName].frequency++;
      });
    });

    // Calculate demand levels and sort
    const trendingSkills = Object.values(skillTrends)
      .map(skill => {
        const frequency = skill.frequency;
        const totalJobs = recentJobs.length;
        const demandPercentage = (frequency / totalJobs) * 100;

        skill.demandLevel = getDemandLevel(demandPercentage);
        skill.salaryImpact = getSalaryImpact(skill.name, skill.category);
        skill.growthRate = calculateGrowthRate(skill.name);

        return skill;
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    res.json({
      success: true,
      data: {
        trendingSkills,
        totalJobsAnalyzed: recentJobs.length,
        industry: industry || 'All Industries',
        experienceLevel: experienceLevel || 'All Levels'
      }
    });

  } catch (error) {
    console.error('Trending skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending skills'
    });
  }
};

// Get skill database
const getSkillDatabase = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;

    // This would typically come from a comprehensive skills database
    // For now, we'll aggregate from job postings
    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$requirements.skills' },
      {
        $group: {
          _id: {
            name: '$requirements.skills.name',
            category: '$requirements.skills.category'
          },
          frequency: { $sum: 1 },
          avgLevel: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$requirements.skills.level', 'Beginner'] }, then: 1 },
              { case: { $eq: ['$requirements.skills.level', 'Intermediate'] }, then: 2 },
              { case: { $eq: ['$requirements.skills.level', 'Advanced'] }, then: 3 },
              { case: { $eq: ['$requirements.skills.level', 'Expert'] }, then: 4 }
            ],
            default: 2
          }}},
          requiredPercentage: {
            $avg: { $cond: ['$requirements.skills.required', 1, 0] }
          }
        }
      },
      { $sort: { frequency: -1 } },
      { $limit: parseInt(limit) }
    ];

    // Add category filter if specified
    if (category) {
      pipeline.splice(1, 0, {
        $match: { 'requirements.skills.category': category }
      });
    }

    // Add search filter if specified
    if (search) {
      pipeline.splice(1, 0, {
        $match: { 'requirements.skills.name': new RegExp(search, 'i') }
      });
    }

    const skills = await Job.aggregate(pipeline);

    const formattedSkills = skills.map(skill => ({
      name: skill._id.name,
      category: skill._id.category,
      frequency: skill.frequency,
      demandLevel: getDemandLevel((skill.frequency / 100) * 100), // Simplified calculation
      avgRequiredLevel: getLevelFromNumber(skill.avgLevel),
      requiredPercentage: Math.round(skill.requiredPercentage * 100),
      salaryImpact: getSalaryImpact(skill._id.name, skill._id.category)
    }));

    res.json({
      success: true,
      data: {
        skills: formattedSkills,
        totalSkills: formattedSkills.length,
        filters: { category, search, limit }
      }
    });

  } catch (error) {
    console.error('Skill database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill database'
    });
  }
};

// Helper functions
const analyzeSkillGaps = (userTechnicalSkills, userSoftSkills, targetJobs) => {
  const userSkillNames = new Set([
    ...userTechnicalSkills.map(s => s.name.toLowerCase()),
    ...userSoftSkills.map(s => s.name.toLowerCase())
  ]);

  const skillDemand = {};
  const missingSkills = {};
  const matchedSkills = {};

  // Analyze each target job
  targetJobs.forEach(job => {
    const jobSkills = job.requirements?.skills || [];
    
    jobSkills.forEach(skill => {
      const skillName = skill.name.toLowerCase();
      const skillKey = skill.name;

      // Track skill demand
      if (!skillDemand[skillKey]) {
        skillDemand[skillKey] = {
          name: skill.name,
          category: skill.category,
          demandCount: 0,
          requiredCount: 0,
          avgLevel: [],
          jobs: []
        };
      }

      skillDemand[skillKey].demandCount++;
      if (skill.required) skillDemand[skillKey].requiredCount++;
      skillDemand[skillKey].avgLevel.push(skill.level);
      skillDemand[skillKey].jobs.push({
        jobId: job._id,
        title: job.title,
        company: job.company.name
      });

      // Check if user has this skill
      if (userSkillNames.has(skillName)) {
        matchedSkills[skillKey] = skillDemand[skillKey];
      } else {
        missingSkills[skillKey] = skillDemand[skillKey];
      }
    });
  });

  // Calculate priority scores for missing skills
  const prioritizedMissingSkills = Object.values(missingSkills)
    .map(skill => ({
      ...skill,
      priority: calculateSkillPriority(skill, targetJobs.length),
      demandPercentage: (skill.demandCount / targetJobs.length) * 100,
      requiredPercentage: (skill.requiredCount / skill.demandCount) * 100,
      avgLevel: getMostCommonLevel(skill.avgLevel)
    }))
    .sort((a, b) => b.priority - a.priority);

  const prioritizedMatchedSkills = Object.values(matchedSkills)
    .map(skill => ({
      ...skill,
      demandPercentage: (skill.demandCount / targetJobs.length) * 100,
      requiredPercentage: (skill.requiredCount / skill.demandCount) * 100,
      avgLevel: getMostCommonLevel(skill.avgLevel)
    }))
    .sort((a, b) => b.demandCount - a.demandCount);

  return {
    missingSkills: prioritizedMissingSkills,
    matchedSkills: prioritizedMatchedSkills,
    skillCoverage: {
      total: Object.keys(skillDemand).length,
      matched: Object.keys(matchedSkills).length,
      missing: Object.keys(missingSkills).length,
      coveragePercentage: (Object.keys(matchedSkills).length / Object.keys(skillDemand).length) * 100
    },
    jobsAnalyzed: targetJobs.length
  };
};

const calculateSkillPriority = (skill, totalJobs) => {
  const demandWeight = (skill.demandCount / totalJobs) * 40; // 40% weight for demand
  const requiredWeight = (skill.requiredCount / skill.demandCount) * 30; // 30% weight for being required
  const categoryWeight = getCategoryWeight(skill.category) * 20; // 20% weight for category importance
  const levelWeight = getLevelWeight(getMostCommonLevel(skill.avgLevel)) * 10; // 10% weight for level

  return demandWeight + requiredWeight + categoryWeight + levelWeight;
};

const getCategoryWeight = (category) => {
  const weights = {
    'Programming': 10,
    'Framework': 9,
    'Cloud': 8,
    'Database': 7,
    'Tool': 6,
    'Soft Skill': 5,
    'Other': 3
  };
  return weights[category] || 5;
};

const getLevelWeight = (level) => {
  const weights = {
    'Expert': 10,
    'Advanced': 8,
    'Intermediate': 6,
    'Beginner': 4
  };
  return weights[level] || 5;
};

const getMostCommonLevel = (levels) => {
  const levelCount = {};
  levels.forEach(level => {
    levelCount[level] = (levelCount[level] || 0) + 1;
  });
  
  return Object.keys(levelCount).reduce((a, b) => 
    levelCount[a] > levelCount[b] ? a : b
  ) || 'Intermediate';
};

const getDemandLevel = (percentage) => {
  if (percentage >= 70) return 'Very High';
  if (percentage >= 50) return 'High';
  if (percentage >= 30) return 'Medium';
  if (percentage >= 10) return 'Low';
  return 'Very Low';
};

const getSalaryImpact = (skillName, category) => {
  // Simplified salary impact calculation
  const highImpactSkills = [
    'machine learning', 'ai', 'blockchain', 'kubernetes', 'aws', 'react', 'python',
    'data science', 'devops', 'cloud architecture'
  ];
  
  const mediumImpactSkills = [
    'javascript', 'java', 'sql', 'docker', 'git', 'agile', 'scrum'
  ];

  const skillLower = skillName.toLowerCase();
  
  if (highImpactSkills.some(skill => skillLower.includes(skill))) {
    return 'High';
  } else if (mediumImpactSkills.some(skill => skillLower.includes(skill))) {
    return 'Medium';
  } else if (category === 'Programming' || category === 'Framework') {
    return 'Medium';
  }
  
  return 'Low';
};

const calculateGrowthRate = (skillName) => {
  // Simplified growth rate calculation
  const highGrowthSkills = [
    'ai', 'machine learning', 'blockchain', 'kubernetes', 'react', 'python',
    'data science', 'cloud', 'devops'
  ];
  
  const skillLower = skillName.toLowerCase();
  
  if (highGrowthSkills.some(skill => skillLower.includes(skill))) {
    return Math.floor(Math.random() * 20) + 15; // 15-35% growth
  }
  
  return Math.floor(Math.random() * 10) + 5; // 5-15% growth
};

const getLevelFromNumber = (num) => {
  if (num >= 3.5) return 'Expert';
  if (num >= 2.5) return 'Advanced';
  if (num >= 1.5) return 'Intermediate';
  return 'Beginner';
};

const generateLearningRecommendations = (missingSkills, userSkills) => {
  return missingSkills.slice(0, 10).map(skill => {
    const difficulty = calculateLearningDifficulty(skill, userSkills);
    const estimatedTime = estimateLearningTime(skill, difficulty);
    const prerequisites = findPrerequisites(skill, userSkills);
    
    return {
      skill: skill.name,
      category: skill.category,
      priority: skill.priority,
      difficulty,
      estimatedTime,
      prerequisites,
      learningPath: generateLearningPath(skill),
      resources: generateLearningResources(skill)
    };
  });
};

const calculateLearningDifficulty = (skill, userSkills) => {
  const relatedSkills = userSkills.filter(userSkill => 
    userSkill.category === skill.category ||
    isRelatedSkill(userSkill.name, skill.name)
  );
  
  if (relatedSkills.length >= 3) return 'Easy';
  if (relatedSkills.length >= 1) return 'Medium';
  return 'Hard';
};

const estimateLearningTime = (skill, difficulty) => {
  const baseHours = {
    'Programming': 80,
    'Framework': 60,
    'Database': 40,
    'Cloud': 50,
    'Tool': 30,
    'Soft Skill': 20,
    'Other': 40
  };
  
  const difficultyMultiplier = {
    'Easy': 0.7,
    'Medium': 1.0,
    'Hard': 1.5
  };
  
  const base = baseHours[skill.category] || 40;
  const multiplier = difficultyMultiplier[difficulty] || 1.0;
  
  return Math.round(base * multiplier);
};

const findPrerequisites = (skill, userSkills) => {
  const prerequisites = {
    'React': ['JavaScript', 'HTML', 'CSS'],
    'Node.js': ['JavaScript'],
    'Django': ['Python'],
    'Kubernetes': ['Docker', 'Linux'],
    'AWS': ['Cloud Computing Basics'],
    'Machine Learning': ['Python', 'Statistics', 'Mathematics']
  };
  
  const skillPrereqs = prerequisites[skill.name] || [];
  const userSkillNames = userSkills.map(s => s.name);
  
  return skillPrereqs.filter(prereq => 
    !userSkillNames.some(userSkill => 
      userSkill.toLowerCase().includes(prereq.toLowerCase())
    )
  );
};

const generateLearningPath = (skill) => {
  // Simplified learning path generation
  const paths = {
    'React': [
      'Learn JavaScript fundamentals',
      'Understand ES6+ features',
      'Learn React basics and JSX',
      'Master React hooks',
      'Build projects with React'
    ],
    'Python': [
      'Learn Python syntax and basics',
      'Understand data structures',
      'Practice with projects',
      'Learn libraries and frameworks',
      'Build real-world applications'
    ]
  };
  
  return paths[skill.name] || [
    `Learn ${skill.name} fundamentals`,
    `Practice ${skill.name} basics`,
    `Build projects with ${skill.name}`,
    `Master advanced ${skill.name} concepts`,
    `Apply ${skill.name} in real scenarios`
  ];
};

const generateLearningResources = (skill) => {
  return [
    {
      type: 'Course',
      title: `Complete ${skill.name} Course`,
      provider: 'Coursera',
      duration: '4-6 weeks',
      cost: 'Free/Paid',
      rating: 4.5,
      url: '#'
    },
    {
      type: 'Documentation',
      title: `Official ${skill.name} Documentation`,
      provider: 'Official',
      duration: 'Self-paced',
      cost: 'Free',
      rating: 4.8,
      url: '#'
    },
    {
      type: 'Tutorial',
      title: `${skill.name} Tutorial Series`,
      provider: 'YouTube',
      duration: '2-3 weeks',
      cost: 'Free',
      rating: 4.3,
      url: '#'
    }
  ];
};

const isRelatedSkill = (skill1, skill2) => {
  const relatedGroups = [
    ['JavaScript', 'React', 'Node.js', 'Vue.js', 'Angular'],
    ['Python', 'Django', 'Flask', 'FastAPI'],
    ['Java', 'Spring', 'Hibernate'],
    ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
    ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB']
  ];
  
  return relatedGroups.some(group => 
    group.some(skill => skill.toLowerCase().includes(skill1.toLowerCase())) &&
    group.some(skill => skill.toLowerCase().includes(skill2.toLowerCase()))
  );
};

module.exports = {
  getSkillGapAnalysis,
  getTrendingSkills,
  getSkillDatabase
};
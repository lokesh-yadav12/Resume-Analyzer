const Job = require('../models/Job');
const Resume = require('../models/Resume');
const axios = require('axios');

// Get job recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, ...filters } = req.query;
    
    // Demo mode - return mock jobs
    if (process.env.DEMO_MODE === 'true') {
      const mockJobs = [
        {
          _id: 'job-1',
          title: 'Senior Full Stack Developer',
          company: { name: 'TechCorp', logo: '', industry: 'Technology' },
          description: 'We are looking for an experienced full stack developer...',
          requirements: { skills: ['React', 'Node.js', 'MongoDB'], experience: { min: 3, max: 5 } },
          details: { location: 'Remote', workMode: 'Remote', salaryRange: { min: 80000, max: 120000, currency: 'USD' } },
          matchPercentage: 92,
          matchedSkills: ['React', 'Node.js'],
          missingSkills: ['MongoDB'],
          postedDate: new Date()
        },
        {
          _id: 'job-2',
          title: 'Frontend Developer',
          company: { name: 'StartupXYZ', logo: '', industry: 'SaaS' },
          description: 'Join our growing team as a frontend developer...',
          requirements: { skills: ['React', 'TypeScript', 'CSS'], experience: { min: 2, max: 4 } },
          details: { location: 'New York', workMode: 'Hybrid', salaryRange: { min: 70000, max: 100000, currency: 'USD' } },
          matchPercentage: 88,
          matchedSkills: ['React'],
          missingSkills: ['TypeScript'],
          postedDate: new Date()
        },
        {
          _id: 'job-3',
          title: 'Python Developer',
          company: { name: 'DataCo', logo: '', industry: 'Data Science' },
          description: 'Looking for a Python developer with ML experience...',
          requirements: { skills: ['Python', 'Django', 'PostgreSQL'], experience: { min: 3, max: 6 } },
          details: { location: 'San Francisco', workMode: 'Onsite', salaryRange: { min: 90000, max: 130000, currency: 'USD' } },
          matchPercentage: 85,
          matchedSkills: ['Python'],
          missingSkills: ['Django', 'PostgreSQL'],
          postedDate: new Date()
        }
      ];
      
      return res.json({
        success: true,
        data: {
          jobs: mockJobs,
          totalPages: 1,
          currentPage: 1,
          total: mockJobs.length
        }
      });
    }

    // Get user's latest resume
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'No resume found. Please upload a resume first.'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true })
      .limit(100)
      .lean();

    // Extract skills from resume
    const resumeSkills = [
      ...resume.analysis.skills.technical.map(s => s.name),
      ...resume.analysis.skills.soft.map(s => s.name)
    ];

    // Call ML service for matching
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/match-jobs`,
        {
          resumeSkills,
          jobs,
          filters
        },
        { timeout: 30000 }
      );

      const matches = mlResponse.data.matches || [];

      // Paginate results
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedMatches = matches.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          jobs: paginatedMatches,
          totalPages: Math.ceil(matches.length / limit),
          currentPage: parseInt(page),
          total: matches.length
        }
      });
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      
      // Fallback: return jobs without matching scores
      const fallbackJobs = jobs.slice((page - 1) * limit, page * limit);
      
      res.json({
        success: true,
        data: {
          jobs: fallbackJobs.map(job => ({
            ...job,
            matchPercentage: 50,
            matchedSkills: [],
            missingSkills: []
          })),
          totalPages: Math.ceil(jobs.length / limit),
          currentPage: parseInt(page),
          total: jobs.length
        }
      });
    }
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job recommendations'
    });
  }
};

// Search jobs
exports.searchJobs = async (req, res) => {
  try {
    const { query, location, workMode, page = 1, limit = 20 } = req.query;

    const searchQuery = { isActive: true };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'company.name': { $regex: query, $options: 'i' } }
      ];
    }

    if (location) {
      searchQuery['details.location'] = { $regex: location, $options: 'i' };
    }

    if (workMode) {
      searchQuery['details.workMode'] = workMode;
    }

    const jobs = await Job.find(searchQuery)
      .sort({ postedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Job.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        jobs,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search jobs'
    });
  }
};

// Get job details
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job details'
    });
  }
};

// Save job
exports.saveJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    // In a real app, you'd have a SavedJobs model
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save job'
    });
  }
};

// Unsave job
exports.unsaveJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave job'
    });
  }
};

// Get saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Placeholder - implement SavedJobs model
    res.json({
      success: true,
      data: {
        jobs: [],
        totalPages: 0,
        currentPage: parseInt(page),
        total: 0
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get saved jobs'
    });
  }
};

module.exports = exports;

const Application = require('../models/Application');
const Job = require('../models/Job');

// Create new job application
const createApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      jobId,
      jobDetails,
      applicationMethod = 'Company Website',
      source = 'Career Boost AI',
      notes,
      priority = 'Medium',
      tags = [],
      documents = {}
    } = req.body;

    // If jobId is provided, get job details from database
    let finalJobDetails = jobDetails;
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        finalJobDetails = {
          title: job.title,
          company: {
            name: job.company.name,
            logo: job.company.logo,
            website: job.company.website
          },
          location: {
            city: job.details?.location?.city,
            state: job.details?.location?.state,
            country: job.details?.location?.country,
            workMode: job.details?.workMode
          },
          salaryRange: job.details?.salaryRange,
          jobUrl: job.externalUrl,
          jobDescription: job.shortDescription || job.description?.substring(0, 500)
        };
      }
    }

    // Check if application already exists for this job
    if (jobId) {
      const existingApplication = await Application.findOne({ userId, jobId });
      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this job'
        });
      }
    }

    const application = new Application({
      userId,
      jobId,
      jobDetails: finalJobDetails,
      applicationMethod,
      source,
      notes,
      priority,
      tags,
      documents,
      statusHistory: [{
        status: 'Applied',
        date: new Date(),
        notes: 'Application submitted',
        updatedBy: 'User'
      }]
    });

    await application.save();

    // Update job application count if jobId exists
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });

  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application'
    });
  }
};

// Get user's applications with filtering and pagination
const getApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      company,
      sortBy = 'appliedDate',
      sortOrder = 'desc',
      search
    } = req.query;

    const query = { userId };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (company) query['jobDetails.company.name'] = new RegExp(company, 'i');
    if (search) {
      query.$or = [
        { 'jobDetails.title': new RegExp(search, 'i') },
        { 'jobDetails.company.name': new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId')
        .lean(),
      Application.countDocuments(query)
    ]);

    // Add computed fields
    const applicationsWithExtras = applications.map(app => ({
      ...app,
      daysSinceApplication: Math.ceil((new Date() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24)),
      nextInterview: getNextInterview(app.interviews),
      pendingFollowUps: getPendingFollowUps(app.followUps)
    }));

    res.json({
      success: true,
      data: {
        applications: applicationsWithExtras,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const application = await Application.findOne({ _id: id, userId })
      .populate('jobId')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add computed fields
    const applicationWithExtras = {
      ...application,
      daysSinceApplication: Math.ceil((new Date() - new Date(application.appliedDate)) / (1000 * 60 * 60 * 24)),
      nextInterview: getNextInterview(application.interviews),
      pendingFollowUps: getPendingFollowUps(application.followUps)
    };

    res.json({
      success: true,
      data: applicationWithExtras
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Update application
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const application = await Application.findOne({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Handle status update with history tracking
    if (updates.status && updates.status !== application.status) {
      await application.updateStatus(updates.status, updates.statusNotes || '', 'User');
      delete updates.status;
      delete updates.statusNotes;
    }

    // Update other fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        application[key] = updates[key];
      }
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const application = await Application.findOneAndDelete({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update job application count if jobId exists
    if (application.jobId) {
      await Job.findByIdAndUpdate(application.jobId, { $inc: { applications: -1 } });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
};

// Schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const interviewData = req.body;

    const application = await Application.findOne({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.scheduleInterview(interviewData);

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview'
    });
  }
};

// Update interview
const updateInterview = async (req, res) => {
  try {
    const { id, interviewId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const application = await Application.findOne({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const interview = application.interviews.id(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        interview[key] = updates[key];
      }
    });

    // Update application status based on interview outcome
    if (updates.outcome === 'Passed' && application.status === 'Interview Scheduled') {
      application.status = 'Interviewed';
    }

    await application.save();

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview'
    });
  }
};

// Add follow-up reminder
const addFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const followUpData = req.body;

    const application = await Application.findOne({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.addFollowUp(followUpData);

    res.json({
      success: true,
      message: 'Follow-up reminder added successfully',
      data: application
    });

  } catch (error) {
    console.error('Add follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add follow-up reminder'
    });
  }
};

// Complete follow-up
const completeFollowUp = async (req, res) => {
  try {
    const { id, followUpId } = req.params;
    const userId = req.user._id;
    const { notes } = req.body;

    const application = await Application.findOne({ _id: id, userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.completeFollowUp(followUpId, notes);

    res.json({
      success: true,
      message: 'Follow-up completed successfully',
      data: application
    });

  } catch (error) {
    console.error('Complete follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete follow-up'
    });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Application.getUserStats(userId);
    const upcomingInterviews = await Application.getUpcomingInterviews(userId);
    const pendingFollowUps = await Application.getPendingFollowUps(userId);

    // Get status distribution
    const statusDistribution = await Application.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly application trend
    const monthlyTrend = await Application.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalApplications: 0,
          activeApplications: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          avgResponseTime: 0,
          avgApplicationToOffer: 0
        },
        statusDistribution,
        monthlyTrend,
        upcomingInterviews: upcomingInterviews.length,
        pendingFollowUps: pendingFollowUps.length
      }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
};

// Get upcoming interviews
const getUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;

    const applications = await Application.getUpcomingInterviews(userId, parseInt(days));

    const interviews = [];
    applications.forEach(app => {
      app.interviews.forEach(interview => {
        const now = new Date();
        const interviewDate = new Date(interview.scheduledDate);
        const daysFromNow = Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24));

        if (daysFromNow >= 0 && daysFromNow <= parseInt(days) && 
            ['Pending', null].includes(interview.outcome)) {
          interviews.push({
            ...interview.toObject(),
            applicationId: app._id,
            jobTitle: app.jobDetails.title,
            company: app.jobDetails.company.name,
            daysFromNow
          });
        }
      });
    });

    interviews.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    res.json({
      success: true,
      data: interviews
    });

  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming interviews'
    });
  }
};

// Helper functions
const getNextInterview = (interviews) => {
  const now = new Date();
  const upcoming = interviews
    .filter(interview => 
      new Date(interview.scheduledDate) > now && 
      ['Pending', null].includes(interview.outcome)
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  
  return upcoming.length > 0 ? upcoming[0] : null;
};

const getPendingFollowUps = (followUps) => {
  const now = new Date();
  return followUps
    .filter(followUp => 
      !followUp.completed && 
      new Date(followUp.scheduledDate) <= now
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  scheduleInterview,
  updateInterview,
  addFollowUp,
  completeFollowUp,
  getApplicationStats,
  getUpcomingInterviews
};
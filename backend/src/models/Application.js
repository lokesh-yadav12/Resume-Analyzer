const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    index: true
  },
  
  // Job details (stored for historical purposes even if job is deleted)
  jobDetails: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      logo: String,
      website: String
    },
    location: {
      city: String,
      state: String,
      country: String,
      workMode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'Onsite'],
        default: 'Onsite'
      }
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    jobUrl: String,
    jobDescription: String
  },
  
  // Application status and timeline
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Interview Scheduled', 'Interviewed', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Applied',
    required: true,
    index: true
  },
  
  appliedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // Application method and source
  applicationMethod: {
    type: String,
    enum: ['Company Website', 'LinkedIn', 'Indeed', 'Glassdoor', 'Referral', 'Email', 'Other'],
    default: 'Company Website'
  },
  
  source: {
    type: String,
    enum: ['Career Boost AI', 'Direct Search', 'Referral', 'Job Board', 'Company Career Page'],
    default: 'Career Boost AI'
  },
  
  // Contact information
  contacts: [{
    name: String,
    title: String,
    email: String,
    phone: String,
    linkedinUrl: String,
    notes: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Interview details
  interviews: [{
    type: {
      type: String,
      enum: ['Phone Screen', 'Video Call', 'Onsite', 'Technical', 'Panel', 'Final', 'Other'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    duration: Number, // in minutes
    interviewer: {
      name: String,
      title: String,
      email: String
    },
    location: String, // for onsite interviews
    meetingLink: String, // for video interviews
    notes: String,
    preparation: {
      questionsAsked: [String],
      questionsToAsk: [String],
      researchNotes: String,
      technicalTopics: [String]
    },
    outcome: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed', 'Cancelled', 'Rescheduled']
    },
    feedback: String,
    nextSteps: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documents and materials
  documents: {
    resumeUrl: String,
    coverLetterUrl: String,
    portfolioUrl: String,
    customDocuments: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['Resume', 'Cover Letter', 'Portfolio', 'Certificate', 'Reference', 'Other']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Follow-up and reminders
  followUps: [{
    type: {
      type: String,
      enum: ['Thank You Email', 'Status Check', 'Additional Info', 'Withdrawal', 'Other'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    notes: String,
    method: {
      type: String,
      enum: ['Email', 'Phone', 'LinkedIn', 'In Person'],
      default: 'Email'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Application notes and tracking
  notes: {
    type: String,
    maxlength: 2000
  },
  
  // Salary negotiation
  salaryNegotiation: {
    initialOffer: {
      base: Number,
      bonus: Number,
      equity: String,
      benefits: [String],
      currency: {
        type: String,
        default: 'USD'
      }
    },
    counterOffer: {
      base: Number,
      bonus: Number,
      equity: String,
      benefits: [String],
      justification: String
    },
    finalOffer: {
      base: Number,
      bonus: Number,
      equity: String,
      benefits: [String],
      startDate: Date,
      accepted: Boolean,
      acceptedDate: Date
    },
    negotiationNotes: String
  },
  
  // Application analytics
  analytics: {
    responseTime: Number, // days from application to first response
    totalInterviews: {
      type: Number,
      default: 0
    },
    applicationToOfferTime: Number, // days from application to offer
    rejectionReason: String,
    feedback: String
  },
  
  // Priority and organization
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Dream Job'],
    default: 'Medium'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Status history for tracking changes
  statusHistory: [{
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Interview Scheduled', 'Interviewed', 'Offer', 'Rejected', 'Withdrawn'],
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: String,
      default: 'User'
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
applicationSchema.index({ userId: 1, appliedDate: -1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ 'jobDetails.company.name': 1 });
applicationSchema.index({ priority: 1, appliedDate: -1 });
applicationSchema.index({ 'interviews.scheduledDate': 1 });
applicationSchema.index({ 'followUps.scheduledDate': 1, 'followUps.completed': 1 });

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.appliedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for next interview
applicationSchema.virtual('nextInterview').get(function() {
  const now = new Date();
  const upcomingInterviews = this.interviews
    .filter(interview => interview.scheduledDate > now && interview.outcome !== 'Cancelled')
    .sort((a, b) => a.scheduledDate - b.scheduledDate);
  
  return upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;
});

// Virtual for pending follow-ups
applicationSchema.virtual('pendingFollowUps').get(function() {
  const now = new Date();
  return this.followUps
    .filter(followUp => !followUp.completed && followUp.scheduledDate <= now)
    .sort((a, b) => a.scheduledDate - b.scheduledDate);
});

// Virtual for application stage
applicationSchema.virtual('applicationStage').get(function() {
  const stageMap = {
    'Applied': 'application',
    'Under Review': 'review',
    'Interview Scheduled': 'interview',
    'Interviewed': 'interview',
    'Offer': 'offer',
    'Rejected': 'closed',
    'Withdrawn': 'closed'
  };
  
  return stageMap[this.status] || 'application';
});

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update analytics
  this.analytics.totalInterviews = this.interviews.length;
  
  // Calculate response time if status changed from Applied
  if (this.status !== 'Applied' && !this.analytics.responseTime) {
    const firstResponse = this.statusHistory.find(h => h.status !== 'Applied');
    if (firstResponse) {
      const diffTime = firstResponse.date - this.appliedDate;
      this.analytics.responseTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }
  
  // Calculate application to offer time
  if (this.status === 'Offer' && !this.analytics.applicationToOfferTime) {
    const diffTime = Date.now() - this.appliedDate;
    this.analytics.applicationToOfferTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  next();
});

// Method to update status with history tracking
applicationSchema.methods.updateStatus = function(newStatus, notes = '', updatedBy = 'User') {
  // Add to status history
  this.statusHistory.push({
    status: this.status, // current status before change
    date: new Date(),
    notes,
    updatedBy
  });
  
  // Update current status
  this.status = newStatus;
  
  return this.save();
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    outcome: 'Pending'
  });
  
  // Update status if not already in interview stage
  if (!['Interview Scheduled', 'Interviewed'].includes(this.status)) {
    this.status = 'Interview Scheduled';
  }
  
  return this.save();
};

// Method to add follow-up reminder
applicationSchema.methods.addFollowUp = function(followUpData) {
  this.followUps.push(followUpData);
  return this.save();
};

// Method to complete follow-up
applicationSchema.methods.completeFollowUp = function(followUpId, notes = '') {
  const followUp = this.followUps.id(followUpId);
  if (followUp) {
    followUp.completed = true;
    followUp.completedDate = new Date();
    followUp.notes = notes;
  }
  return this.save();
};

// Static method to get user's application statistics
applicationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        activeApplications: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Applied', 'Under Review', 'Interview Scheduled', 'Interviewed']] },
              1,
              0
            ]
          }
        },
        interviews: { $sum: '$analytics.totalInterviews' },
        offers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0]
          }
        },
        rejections: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0]
          }
        },
        avgResponseTime: { $avg: '$analytics.responseTime' },
        avgApplicationToOffer: { $avg: '$analytics.applicationToOfferTime' }
      }
    }
  ]);
};

// Static method to get applications by status
applicationSchema.statics.getByStatus = function(userId, status, limit = 10) {
  return this.find({ userId, status })
    .sort({ appliedDate: -1 })
    .limit(limit)
    .populate('jobId');
};

// Static method to get upcoming interviews
applicationSchema.statics.getUpcomingInterviews = function(userId, days = 7) {
  const startDate = new Date();
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return this.find({
    userId,
    'interviews.scheduledDate': {
      $gte: startDate,
      $lte: endDate
    },
    'interviews.outcome': { $in: ['Pending', null] }
  }).sort({ 'interviews.scheduledDate': 1 });
};

// Static method to get pending follow-ups
applicationSchema.statics.getPendingFollowUps = function(userId) {
  const now = new Date();
  
  return this.find({
    userId,
    'followUps.scheduledDate': { $lte: now },
    'followUps.completed': false
  }).sort({ 'followUps.scheduledDate': 1 });
};

module.exports = mongoose.model('Application', applicationSchema);
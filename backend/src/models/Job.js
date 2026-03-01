const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic job information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  
  company: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    logo: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Company logo must be a valid URL'
      }
    },
    size: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
      default: 'Medium'
    },
    industry: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true
    },
    description: {
      type: String,
      maxlength: 1000
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL'
      }
    },
    founded: Number,
    employees: {
      min: Number,
      max: Number
    }
  },
  
  // Job description and requirements
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  shortDescription: {
    type: String,
    maxlength: 500
  },
  
  requirements: {
    skills: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
      },
      required: {
        type: Boolean,
        default: true
      },
      category: {
        type: String,
        enum: ['Programming', 'Framework', 'Database', 'Cloud', 'Tool', 'Soft Skill', 'Other'],
        default: 'Other'
      }
    }],
    
    experience: {
      min: {
        type: Number,
        min: 0,
        max: 50,
        default: 0
      },
      max: {
        type: Number,
        min: 0,
        max: 50
      },
      level: {
        type: String,
        enum: ['Entry', 'Mid', 'Senior', 'Executive'],
        default: 'Mid'
      }
    },
    
    education: {
      degree: {
        type: String,
        enum: ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Not Required'],
        default: 'Bachelor'
      },
      field: String,
      required: {
        type: Boolean,
        default: false
      }
    },
    
    certifications: [{
      name: String,
      required: {
        type: Boolean,
        default: false
      },
      preferred: {
        type: Boolean,
        default: true
      }
    }],
    
    languages: [{
      name: String,
      level: {
        type: String,
        enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
        default: 'Conversational'
      }
    }]
  },
  
  // Job details
  details: {
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'United States'
      },
      remote: {
        type: Boolean,
        default: false
      },
      hybrid: {
        type: Boolean,
        default: false
      },
      onsite: {
        type: Boolean,
        default: true
      }
    },
    
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite'],
      required: true,
      index: true
    },
    
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
      default: 'Full-time',
      index: true
    },
    
    salaryRange: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        default: 'USD'
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    
    benefits: [{
      type: String,
      enum: [
        'Health Insurance',
        'Dental Insurance',
        'Vision Insurance',
        '401k',
        'Paid Time Off',
        'Remote Work',
        'Flexible Hours',
        'Professional Development',
        'Stock Options',
        'Bonus',
        'Commuter Benefits',
        'Gym Membership',
        'Free Meals',
        'Other'
      ]
    }],
    
    schedule: {
      hoursPerWeek: {
        type: Number,
        min: 1,
        max: 80,
        default: 40
      },
      flexible: {
        type: Boolean,
        default: false
      },
      timezone: String
    }
  },
  
  // ML and matching data
  embedding: {
    type: [Number],
    index: true
  },
  
  keywords: [{
    word: String,
    weight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  }],
  
  // Source and external data
  source: {
    platform: {
      type: String,
      enum: ['LinkedIn', 'Indeed', 'Glassdoor', 'AngelList', 'Stack Overflow', 'Company Website', 'Manual'],
      required: true
    },
    externalId: String,
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Source URL must be a valid URL'
      }
    },
    lastSynced: {
      type: Date,
      default: Date.now
    }
  },
  
  externalUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'External URL must be a valid URL'
    }
  },
  
  // Dates and status
  postedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  applicationDeadline: {
    type: Date,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics and engagement
  views: {
    type: Number,
    default: 0
  },
  
  applications: {
    type: Number,
    default: 0
  },
  
  saves: {
    type: Number,
    default: 0
  },
  
  // Quality and verification
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  priority: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
jobSchema.index({ 'company.industry': 1, 'details.workMode': 1 });
jobSchema.index({ 'requirements.experience.level': 1 });
jobSchema.index({ 'details.location.city': 1, 'details.location.state': 1 });
jobSchema.index({ postedDate: -1, isActive: 1 });
jobSchema.index({ 'details.salaryRange.min': 1, 'details.salaryRange.max': 1 });
jobSchema.index({ qualityScore: -1, isFeatured: -1 });

// Compound indexes for common queries
jobSchema.index({ 
  isActive: 1, 
  'details.workMode': 1, 
  'requirements.experience.level': 1,
  postedDate: -1 
});

// Virtual for full location string
jobSchema.virtual('fullLocation').get(function() {
  const { city, state, country } = this.details.location;
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ');
});

// Virtual for salary range string
jobSchema.virtual('salaryRangeString').get(function() {
  const { min, max, currency, period } = this.details.salaryRange;
  
  if (!min && !max) return null;
  
  const formatSalary = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  
  const periodSuffix = period === 'yearly' ? '/year' : period === 'monthly' ? '/month' : '/hour';
  
  if (min && max) {
    return `${currency} ${formatSalary(min)} - ${formatSalary(max)}${periodSuffix}`;
  } else if (min) {
    return `${currency} ${formatSalary(min)}+${periodSuffix}`;
  } else {
    return `Up to ${currency} ${formatSalary(max)}${periodSuffix}`;
  }
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.postedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for application urgency
jobSchema.virtual('urgency').get(function() {
  if (!this.applicationDeadline) return 'low';
  
  const now = new Date();
  const daysUntilDeadline = Math.ceil((this.applicationDeadline - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline <= 3) return 'high';
  if (daysUntilDeadline <= 7) return 'medium';
  return 'low';
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 200) + '...';
  }
  
  // Set expiration date if not set (default 90 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to calculate match score with a resume
jobSchema.methods.calculateMatchScore = function(resumeSkills, resumeExperience, preferences = {}) {
  let score = 0;
  let breakdown = {
    skills: 0,
    experience: 0,
    location: 0,
    workMode: 0,
    salary: 0
  };
  
  // Skills matching (50% weight)
  const requiredSkills = this.requirements.skills.filter(skill => skill.required);
  const preferredSkills = this.requirements.skills.filter(skill => !skill.required);
  
  let skillsMatched = 0;
  let totalSkills = requiredSkills.length + (preferredSkills.length * 0.5);
  
  resumeSkills.forEach(resumeSkill => {
    const matchedRequired = requiredSkills.find(jobSkill => 
      jobSkill.name.toLowerCase() === resumeSkill.name.toLowerCase()
    );
    const matchedPreferred = preferredSkills.find(jobSkill => 
      jobSkill.name.toLowerCase() === resumeSkill.name.toLowerCase()
    );
    
    if (matchedRequired) {
      skillsMatched += 1;
    } else if (matchedPreferred) {
      skillsMatched += 0.5;
    }
  });
  
  breakdown.skills = totalSkills > 0 ? (skillsMatched / totalSkills) * 50 : 0;
  
  // Experience matching (25% weight)
  const jobExpMin = this.requirements.experience.min || 0;
  const jobExpMax = this.requirements.experience.max || 50;
  const userExp = resumeExperience || 0;
  
  if (userExp >= jobExpMin && userExp <= jobExpMax) {
    breakdown.experience = 25;
  } else if (userExp >= jobExpMin) {
    // Overqualified but still good
    breakdown.experience = 20;
  } else {
    // Underqualified
    const ratio = userExp / jobExpMin;
    breakdown.experience = Math.max(ratio * 25, 0);
  }
  
  // Location matching (10% weight)
  if (preferences.location) {
    if (this.details.workMode === 'Remote' || 
        (preferences.location.toLowerCase().includes(this.details.location.city?.toLowerCase()) ||
         preferences.location.toLowerCase().includes(this.details.location.state?.toLowerCase()))) {
      breakdown.location = 10;
    } else {
      breakdown.location = 0;
    }
  } else {
    breakdown.location = 5; // Neutral if no preference
  }
  
  // Work mode matching (10% weight)
  if (preferences.workMode) {
    if (preferences.workMode === this.details.workMode || 
        this.details.workMode === 'Remote') {
      breakdown.workMode = 10;
    } else {
      breakdown.workMode = 5;
    }
  } else {
    breakdown.workMode = 5; // Neutral if no preference
  }
  
  // Salary matching (5% weight)
  if (preferences.salaryMin && this.details.salaryRange.max) {
    if (this.details.salaryRange.max >= preferences.salaryMin) {
      breakdown.salary = 5;
    } else {
      breakdown.salary = 0;
    }
  } else {
    breakdown.salary = 2.5; // Neutral if no data
  }
  
  score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return {
    totalScore: Math.round(score),
    breakdown,
    explanation: this._generateMatchExplanation(breakdown)
  };
};

// Method to generate match explanation
jobSchema.methods._generateMatchExplanation = function(breakdown) {
  const explanations = [];
  
  if (breakdown.skills >= 40) {
    explanations.push("Strong skill match");
  } else if (breakdown.skills >= 25) {
    explanations.push("Good skill alignment");
  } else {
    explanations.push("Some skill gaps to address");
  }
  
  if (breakdown.experience >= 20) {
    explanations.push("Experience level fits well");
  } else if (breakdown.experience >= 15) {
    explanations.push("Close experience match");
  } else {
    explanations.push("May need more experience");
  }
  
  if (breakdown.location >= 8) {
    explanations.push("Great location match");
  }
  
  if (breakdown.workMode >= 8) {
    explanations.push("Work mode preference aligned");
  }
  
  return explanations.join(", ");
};

// Static method to find similar jobs
jobSchema.statics.findSimilar = function(jobId, limit = 5) {
  return this.aggregate([
    { $match: { _id: { $ne: jobId }, isActive: true } },
    { $sample: { size: limit * 2 } }, // Get more to filter
    { $limit: limit }
  ]);
};

// Static method for advanced search
jobSchema.statics.advancedSearch = function(filters = {}) {
  const query = { isActive: true };
  const sort = {};
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
    sort.score = { $meta: 'textScore' };
  }
  
  // Location filter
  if (filters.location) {
    query.$or = [
      { 'details.location.city': new RegExp(filters.location, 'i') },
      { 'details.location.state': new RegExp(filters.location, 'i') },
      { 'details.workMode': 'Remote' }
    ];
  }
  
  // Work mode filter
  if (filters.workMode && filters.workMode !== 'Any') {
    query['details.workMode'] = filters.workMode;
  }
  
  // Experience level filter
  if (filters.experienceLevel) {
    query['requirements.experience.level'] = filters.experienceLevel;
  }
  
  // Salary range filter
  if (filters.salaryMin || filters.salaryMax) {
    query['details.salaryRange'] = {};
    if (filters.salaryMin) {
      query['details.salaryRange.max'] = { $gte: filters.salaryMin };
    }
    if (filters.salaryMax) {
      query['details.salaryRange.min'] = { $lte: filters.salaryMax };
    }
  }
  
  // Employment type filter
  if (filters.employmentType) {
    query['details.employmentType'] = filters.employmentType;
  }
  
  // Company size filter
  if (filters.companySize) {
    query['company.size'] = filters.companySize;
  }
  
  // Posted date filter
  if (filters.postedWithin) {
    const days = parseInt(filters.postedWithin);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    query.postedDate = { $gte: cutoffDate };
  }
  
  // Default sort
  if (!sort.score) {
    sort.postedDate = -1;
    sort.isFeatured = -1;
    sort.qualityScore = -1;
  }
  
  return this.find(query).sort(sort);
};

module.exports = mongoose.model('Job', jobSchema);
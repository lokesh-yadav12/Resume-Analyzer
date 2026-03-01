const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.linkedinId && !this.githubId;
    },
    minlength: 8,
    validate: {
      validator: function(password) {
        if (!password && (this.googleId || this.linkedinId || this.githubId)) {
          return true; // Social login users don't need password
        }
        // Password must contain at least one uppercase, lowercase, number, and special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    }
  },
  
  // Social login IDs
  googleId: String,
  linkedinId: String,
  githubId: String,
  
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100
    },
    linkedinUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/, 'Please enter a valid LinkedIn URL']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 500
    },
    targetRoles: [{
      type: String,
      trim: true
    }],
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Executive'],
      default: 'Entry'
    },
    preferredLocations: [{
      type: String,
      trim: true
    }],
    workModePreference: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite', 'Any'],
      default: 'Any'
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
      }
    },
    industry: {
      type: String,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50
    }
  },
  
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      jobAlerts: {
        type: Boolean,
        default: true
      },
      learningReminders: {
        type: Boolean,
        default: true
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      shareAnalytics: {
        type: Boolean,
        default: false
      },
      allowDataCollection: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de'],
      default: 'en'
    }
  },
  
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Premium', 'Enterprise'],
      default: 'Free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      }
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  
  // Account status and verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLoginAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Analytics and tracking
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  // Saved jobs
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
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
userSchema.index({ email: 1 });
userSchema.index({ 'profile.targetRoles': 1 });
userSchema.index({ 'profile.experienceLevel': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update profile completeness
userSchema.pre('save', function(next) {
  this.profileCompleteness = this.calculateProfileCompleteness();
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let completeness = 0;
  const fields = [
    'profile.firstName',
    'profile.lastName', 
    'profile.phone',
    'profile.location',
    'profile.linkedinUrl',
    'profile.bio',
    'profile.experienceLevel',
    'profile.industry',
    'profile.yearsOfExperience'
  ];
  
  fields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value && value.toString().trim()) {
      completeness += 100 / fields.length;
    }
  });
  
  // Bonus points for arrays
  if (this.profile.targetRoles && this.profile.targetRoles.length > 0) {
    completeness += 10;
  }
  if (this.profile.preferredLocations && this.profile.preferredLocations.length > 0) {
    completeness += 10;
  }
  
  return Math.min(Math.round(completeness), 100);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Static method to find user by reset token
userSchema.statics.findByPasswordResetToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

// Static method to find user by email verification token
userSchema.statics.findByEmailVerificationToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

module.exports = mongoose.model('User', userSchema);
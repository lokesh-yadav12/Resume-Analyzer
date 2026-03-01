const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Signup validation schema
const signupSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, lowercase letter, number, and special character',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, lowercase letter, number, and special character',
      'any.required': 'Password is required'
    })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, lowercase letter, number, and special character',
      'any.required': 'New password is required'
    })
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string().trim().min(1).max(50),
    lastName: Joi.string().trim().min(1).max(50),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/),
    location: Joi.string().trim().max(100),
    linkedinUrl: Joi.string().pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/),
    bio: Joi.string().max(500),
    targetRoles: Joi.array().items(Joi.string().trim()),
    experienceLevel: Joi.string().valid('Entry', 'Mid', 'Senior', 'Executive'),
    preferredLocations: Joi.array().items(Joi.string().trim()),
    workModePreference: Joi.string().valid('Remote', 'Hybrid', 'Onsite', 'Any'),
    salaryRange: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD')
    }),
    industry: Joi.string().trim(),
    yearsOfExperience: Joi.number().min(0).max(50)
  }),
  
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean(),
      jobAlerts: Joi.boolean(),
      learningReminders: Joi.boolean(),
      weeklyDigest: Joi.boolean()
    }),
    privacy: Joi.object({
      profileVisible: Joi.boolean(),
      shareAnalytics: Joi.boolean(),
      allowDataCollection: Joi.boolean()
    }),
    theme: Joi.string().valid('light', 'dark', 'system'),
    language: Joi.string().valid('en', 'es', 'fr', 'de')
  })
});

// Resume upload validation
const resumeUploadSchema = Joi.object({
  fileName: Joi.string().required(),
  fileSize: Joi.number().max(5 * 1024 * 1024), // 5MB max
  fileType: Joi.string().valid('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain')
});

// Job application validation
const jobApplicationSchema = Joi.object({
  jobId: Joi.string().required(),
  status: Joi.string().valid('Applied', 'Interview', 'Offer', 'Rejected').default('Applied'),
  appliedDate: Joi.date().default(Date.now),
  notes: Joi.string().max(1000),
  customResumeUrl: Joi.string().uri(),
  coverLetterUrl: Joi.string().uri()
});

// Learning progress validation
const learningProgressSchema = Joi.object({
  skillName: Joi.string().required(),
  status: Joi.string().valid('Learning', 'Completed').required(),
  hoursSpent: Joi.number().min(0),
  courseUrl: Joi.string().uri(),
  notes: Joi.string().max(500)
});

// ATS calculation validation
const atsCalculationSchema = Joi.object({
  jobKeywords: Joi.array().items(Joi.string().trim().min(1)).max(50).optional()
});

// ATS text calculation validation
const atsTextCalculationSchema = Joi.object({
  text: Joi.string().min(50).max(10000).required().messages({
    'string.min': 'Text must be at least 50 characters long',
    'string.max': 'Text cannot exceed 10,000 characters',
    'any.required': 'Text is required for ATS analysis'
  }),
  jobKeywords: Joi.array().items(Joi.string().trim().min(1)).max(50).optional()
});

// ATS comparison validation
const atsComparisonSchema = Joi.object({
  resumeIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(2)
    .max(5)
    .required()
    .messages({
      'array.min': 'At least 2 resume IDs are required for comparison',
      'array.max': 'Maximum 5 resumes can be compared at once',
      'string.pattern.base': 'Invalid resume ID format'
    })
});

// Export validation middleware functions
module.exports = {
  validateSignup: validate(signupSchema),
  validateLogin: validate(loginSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateUpdateProfile: validate(updateProfileSchema),
  validateResumeUpload: validate(resumeUploadSchema),
  validateJobApplication: validate(jobApplicationSchema),
  validateLearningProgress: validate(learningProgressSchema),
  validateATSCalculation: validate(atsCalculationSchema),
  validateATSTextCalculation: validate(atsTextCalculationSchema),
  validateATSComparison: validate(atsComparisonSchema),
  
  // Export schemas for custom validation
  schemas: {
    signup: signupSchema,
    login: loginSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
    changePassword: changePasswordSchema,
    updateProfile: updateProfileSchema,
    resumeUpload: resumeUploadSchema,
    jobApplication: jobApplicationSchema,
    learningProgress: learningProgressSchema,
    atsCalculation: atsCalculationSchema,
    atsTextCalculation: atsTextCalculationSchema,
    atsComparison: atsComparisonSchema
  }
};
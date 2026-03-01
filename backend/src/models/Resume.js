const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  analysis: {
    atsScore: {
      totalScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      breakdown: {
        keywordMatch: { type: Number, default: 0 },
        contactInfo: { type: Number, default: 0 },
        structure: { type: Number, default: 0 },
        formatting: { type: Number, default: 0 },
        quantifiable: { type: Number, default: 0 }
      },
      grade: {
        type: String,
        enum: ['A+', 'A', 'B', 'C', 'D', 'F', 'Pending'],
        default: 'Pending'
      },
      suggestions: [{
        category: String,
        message: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low']
        }
      }]
    },
    skills: {
      technical: [{
        name: String,
        category: String,
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        },
        yearsExperience: Number
      }],
      soft: [{
        name: String,
        evidence: [String]
      }],
      certifications: [{
        name: String,
        issuer: String,
        dateObtained: Date,
        expirationDate: Date
      }]
    },
    experience: {
      totalYears: {
        type: Number,
        default: 0
      },
      positions: [{
        title: String,
        company: String,
        duration: String,
        startDate: Date,
        endDate: Date,
        responsibilities: [String],
        achievements: [String]
      }]
    },
    education: [{
      degree: String,
      institution: String,
      field: String,
      graduationYear: Number,
      gpa: Number
    }],
    contact: {
      email: String,
      phone: String,
      linkedin: String,
      github: String,
      website: String,
      location: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ analysisStatus: 1 });

// Virtual for file extension
resumeSchema.virtual('fileExtension').get(function() {
  return this.originalFileName.split('.').pop().toLowerCase();
});

// Method to calculate grade from score
resumeSchema.methods.calculateGrade = function() {
  const score = this.analysis.atsScore.totalScore;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

// Pre-save hook to update grade
resumeSchema.pre('save', function(next) {
  if (this.analysis.atsScore.totalScore > 0) {
    this.analysis.atsScore.grade = this.calculateGrade();
  }
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;

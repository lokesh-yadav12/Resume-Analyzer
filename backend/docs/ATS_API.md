# ATS Scoring API Documentation

This document describes the ATS (Applicant Tracking System) scoring API endpoints for Career Boost AI.

## Base URL
```
/api/ats
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Calculate ATS Score for Resume

Calculate ATS score for an existing resume with optional job-specific keywords.

**Endpoint:** `POST /api/ats/calculate/:resumeId`

**Parameters:**
- `resumeId` (path): The ID of the resume to analyze

**Request Body:**
```json
{
  "jobKeywords": ["javascript", "react", "node.js", "mongodb"] // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resumeId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "atsScore": {
      "totalScore": 78.5,
      "breakdown": {
        "keywordMatch": 32.5,
        "contactInfo": 15,
        "structure": 18,
        "formatting": 13,
        "quantifiable": 8
      },
      "grade": "B",
      "suggestions": [
        "Add more quantifiable achievements with specific numbers and percentages",
        "Include more relevant keywords from job descriptions"
      ]
    },
    "calculatedAt": "2024-01-15T10:30:00.000Z",
    "jobKeywords": ["javascript", "react", "node.js", "mongodb"]
  }
}
```

### 2. Calculate ATS Score for Text

Calculate ATS score for raw text without saving to database.

**Endpoint:** `POST /api/ats/calculate-text`

**Request Body:**
```json
{
  "text": "John Doe\nSoftware Engineer\n...", // Required, min 50 chars
  "jobKeywords": ["python", "django", "aws"] // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "atsScore": {
      "totalScore": 65.2,
      "breakdown": {
        "keywordMatch": 25.0,
        "contactInfo": 10,
        "structure": 15,
        "formatting": 12,
        "quantifiable": 3.2
      },
      "grade": "C",
      "suggestions": [
        "Add complete contact information including LinkedIn profile",
        "Include more measurable achievements with numbers and percentages"
      ]
    },
    "calculatedAt": "2024-01-15T10:30:00.000Z",
    "jobKeywords": ["python", "django", "aws"],
    "textLength": 1250,
    "wordCount": 185
  }
}
```

### 3. Get ATS Improvement Suggestions

Get detailed improvement suggestions for a specific resume.

**Endpoint:** `GET /api/ats/suggestions/:resumeId`

**Response:**
```json
{
  "success": true,
  "data": {
    "resumeId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "currentScore": 78.5,
    "currentGrade": "B",
    "suggestions": [
      {
        "category": "Keywords",
        "priority": "high",
        "issue": "Low keyword relevance",
        "suggestion": "Include more industry-specific keywords and action verbs from job descriptions",
        "impact": "Could improve score by 10-15 points",
        "examples": [
          "Use terms like 'developed', 'implemented', 'managed'",
          "Include technical skills mentioned in job postings"
        ]
      },
      {
        "category": "Achievements",
        "priority": "high",
        "issue": "Lack of measurable accomplishments",
        "suggestion": "Add specific numbers, percentages, and measurable results",
        "impact": "Could improve score by 5-10 points",
        "examples": [
          "Increased sales by 25%",
          "Managed team of 8 developers",
          "Reduced costs by $50K annually"
        ]
      }
    ],
    "breakdown": {
      "keywordMatch": 32.5,
      "contactInfo": 15,
      "structure": 18,
      "formatting": 13,
      "quantifiable": 8
    },
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Compare ATS Scores

Compare ATS scores between multiple resumes (2-5 resumes).

**Endpoint:** `POST /api/ats/compare`

**Request Body:**
```json
{
  "resumeIds": [
    "64f8a1b2c3d4e5f6a7b8c9d0",
    "64f8a1b2c3d4e5f6a7b8c9d1",
    "64f8a1b2c3d4e5f6a7b8c9d2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "resumeId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "fileName": "resume_v2.pdf",
        "atsScore": 85.2,
        "grade": "A",
        "breakdown": {
          "keywordMatch": 38,
          "contactInfo": 15,
          "structure": 19,
          "formatting": 13.2,
          "quantifiable": 10
        },
        "createdAt": "2024-01-10T08:00:00.000Z"
      },
      {
        "resumeId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fileName": "resume_v1.pdf",
        "atsScore": 78.5,
        "grade": "B",
        "breakdown": {
          "keywordMatch": 32.5,
          "contactInfo": 15,
          "structure": 18,
          "formatting": 13,
          "quantifiable": 8
        },
        "createdAt": "2024-01-05T10:30:00.000Z"
      }
    ],
    "insights": {
      "bestScore": 85.2,
      "worstScore": 78.5,
      "averageScore": 82,
      "scoreRange": 6.7,
      "improvementPotential": 14.8
    },
    "comparedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Get ATS Score History

Get historical ATS scores for the authenticated user.

**Endpoint:** `GET /api/ats/history`

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "resumeId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "fileName": "resume_latest.pdf",
        "atsScore": 88.5,
        "grade": "A",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "lastUpdated": "2024-01-15T10:30:00.000Z"
      },
      {
        "resumeId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "fileName": "resume_v2.pdf",
        "atsScore": 85.2,
        "grade": "A",
        "createdAt": "2024-01-10T08:00:00.000Z",
        "lastUpdated": "2024-01-10T08:00:00.000Z"
      }
    ],
    "trend": "improving",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 6. Get Grade Information

Get information about ATS grading system and scoring criteria.

**Endpoint:** `GET /api/ats/grade-info`

**Response:**
```json
{
  "success": true,
  "data": {
    "gradeInfo": {
      "A+": {
        "range": "90-100",
        "description": "Excellent ATS compatibility",
        "color": "#22c55e",
        "recommendations": [
          "Your resume is highly optimized for ATS systems",
          "Focus on tailoring keywords for specific jobs"
        ]
      },
      "A": {
        "range": "85-89",
        "description": "Very good ATS compatibility",
        "color": "#16a34a",
        "recommendations": [
          "Add a few more quantifiable achievements",
          "Consider minor keyword optimization"
        ]
      },
      "B": {
        "range": "75-84",
        "description": "Good ATS compatibility",
        "color": "#eab308",
        "recommendations": [
          "Improve section structure and formatting",
          "Add more relevant keywords and achievements"
        ]
      },
      "C": {
        "range": "65-74",
        "description": "Fair ATS compatibility",
        "color": "#f59e0b",
        "recommendations": [
          "Significant improvements needed in multiple areas",
          "Focus on contact info, keywords, and structure"
        ]
      },
      "D": {
        "range": "0-64",
        "description": "Poor ATS compatibility",
        "color": "#ef4444",
        "recommendations": [
          "Major overhaul needed",
          "Start with basic structure and contact information"
        ]
      }
    },
    "scoringCriteria": {
      "keywordMatch": {
        "max": 40,
        "description": "Relevance to job requirements"
      },
      "contactInfo": {
        "max": 15,
        "description": "Complete contact information"
      },
      "structure": {
        "max": 20,
        "description": "Clear sections and organization"
      },
      "formatting": {
        "max": 15,
        "description": "Professional formatting and length"
      },
      "quantifiable": {
        "max": 10,
        "description": "Measurable achievements"
      }
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Text must be at least 50 characters long"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resume not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many ATS calculations. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to calculate ATS score"
}
```

## Rate Limits

- **ATS Calculations**: 20 requests per hour per user
- **User-specific calculations**: 10 requests per hour per user
- **General API**: 100 requests per 15 minutes per IP

## Notes

1. All ATS calculations require email verification
2. Resume text must be at least 50 characters for analysis
3. Job keywords are optional but improve accuracy when provided
4. Scores are cached and updated only when recalculated
5. Historical data is maintained for trend analysis
6. Comparison supports 2-5 resumes maximum for performance
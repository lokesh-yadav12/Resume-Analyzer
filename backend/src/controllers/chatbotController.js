const Resume = require('../models/Resume');

// Simple chatbot responses (in production, integrate with OpenAI GPT-4)
const responses = {
  greeting: [
    "Hello! I'm your AI career advisor. How can I help you today?",
    "Hi there! I'm here to help with your career questions. What would you like to know?"
  ],
  resume: [
    "I can help you improve your resume! Upload your resume and I'll provide detailed feedback on ATS compatibility, skills, and formatting.",
    "Your resume is your first impression. Let me analyze it and suggest improvements to help you stand out."
  ],
  jobs: [
    "I can help you find the perfect job match! Based on your skills and experience, I'll recommend positions that align with your career goals.",
    "Looking for jobs? I'll match you with opportunities that fit your profile and help you understand what skills you might need to develop."
  ],
  skills: [
    "Let's talk about your skills! I can identify gaps in your skillset and recommend courses to help you grow professionally.",
    "Skills are key to career advancement. I can analyze your current skills and suggest areas for improvement."
  ],
  interview: [
    "Interview preparation is crucial! I can provide tips on common questions, how to present your experience, and what employers look for.",
    "Let me help you ace that interview! I'll share strategies for answering tough questions and making a great impression."
  ],
  salary: [
    "Salary negotiation can be tricky. I can provide insights on market rates for your role and tips on how to negotiate effectively.",
    "Let's discuss compensation! I can help you understand your market value and how to approach salary discussions."
  ],
  default: [
    "That's an interesting question! Could you provide more details so I can give you the best advice?",
    "I'm here to help with career advice, resume tips, job search strategies, and more. What specific area would you like to explore?"
  ]
};

// Get chatbot response
exports.getChatResponse = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get user context
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    
    // Analyze message intent
    const intent = analyzeIntent(message.toLowerCase());
    
    // Generate response
    const responseText = generateResponse(intent, resume);

    // In production, save conversation to database
    const response = {
      id: Date.now().toString(),
      message: responseText,
      timestamp: new Date(),
      intent
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response'
    });
  }
};

// Get conversation history
exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.query;

    // In production, fetch from database
    res.json({
      success: true,
      data: {
        messages: []
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history'
    });
  }
};

function analyzeIntent(message) {
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return 'greeting';
  }
  if (message.includes('resume') || message.includes('cv')) {
    return 'resume';
  }
  if (message.includes('job') || message.includes('position') || message.includes('career')) {
    return 'jobs';
  }
  if (message.includes('skill') || message.includes('learn') || message.includes('course')) {
    return 'skills';
  }
  if (message.includes('interview')) {
    return 'interview';
  }
  if (message.includes('salary') || message.includes('pay') || message.includes('compensation')) {
    return 'salary';
  }
  return 'default';
}

function generateResponse(intent, resume) {
  const responseList = responses[intent] || responses.default;
  let response = responseList[Math.floor(Math.random() * responseList.length)];

  // Add personalization if resume exists
  if (resume && intent === 'resume') {
    const score = resume.analysis?.atsScore?.totalScore || 0;
    response += ` Your current ATS score is ${Math.round(score)}/100.`;
  }

  if (resume && intent === 'skills') {
    const skillCount = (resume.analysis?.skills?.technical?.length || 0) + 
                      (resume.analysis?.skills?.soft?.length || 0);
    response += ` I've identified ${skillCount} skills in your resume.`;
  }

  return response;
}

module.exports = exports;

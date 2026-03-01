const axios = require('axios');
const Resume = require('../models/Resume');
const Application = require('../models/Application');

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map();

// Career advisor chatbot
const chatWithCareerAdvisor = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { message, conversationId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get or create conversation
    const convId = conversationId || `conv_${userId}_${Date.now()}`;
    let conversation = conversations.get(convId) || {
      id: convId,
      userId,
      messages: [],
      context: null,
      createdAt: new Date()
    };

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get user context if not already loaded
    if (!conversation.context) {
      conversation.context = await getUserContext(userId);
    }

    // Generate AI response
    const aiResponse = await generateCareerAdvice(message, conversation);

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Store updated conversation
    conversations.set(convId, conversation);

    // Clean up old conversations (keep last 100 per user)
    cleanupOldConversations(userId);

    res.json({
      success: true,
      data: {
        conversationId: convId,
        message: aiResponse,
        context: {
          hasResume: !!conversation.context.latestResume,
          applicationCount: conversation.context.applicationStats.totalApplications,
          skillCount: conversation.context.skillCount
        }
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.params;

    const conversation = conversations.get(conversationId);

    if (!conversation || conversation.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        messages: conversation.messages,
        createdAt: conversation.createdAt
      }
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history'
    });
  }
};

// Get user's conversations
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { limit = 10 } = req.query;

    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit))
      .map(conv => ({
        id: conv.id,
        lastMessage: conv.messages[conv.messages.length - 1]?.content?.substring(0, 100) + '...',
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        updatedAt: conv.messages[conv.messages.length - 1]?.timestamp
      }));

    res.json({
      success: true,
      data: userConversations
    });

  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
};

// Delete conversation
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.params;

    const conversation = conversations.get(conversationId);

    if (!conversation || conversation.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversations.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};

// Helper functions
const getUserContext = async (userId) => {
  try {
    // Get latest resume
    const latestResume = await Resume.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get application statistics
    const applicationStats = await Application.getUserStats(userId);

    // Get recent applications
    const recentApplications = await Application.find({ userId })
      .sort({ appliedDate: -1 })
      .limit(5)
      .select('jobDetails.title jobDetails.company.name status appliedDate')
      .lean();

    return {
      user: {
        id: userId,
        // Add user profile info if needed
      },
      latestResume: latestResume ? {
        fileName: latestResume.originalFileName,
        atsScore: latestResume.analysis?.atsScore?.totalScore,
        skillCount: (latestResume.analysis?.skills?.technical?.length || 0) + 
                   (latestResume.analysis?.skills?.soft?.length || 0),
        analyzedAt: latestResume.createdAt
      } : null,
      applicationStats: applicationStats[0] || {
        totalApplications: 0,
        activeApplications: 0,
        interviews: 0,
        offers: 0,
        rejections: 0
      },
      recentApplications,
      skillCount: latestResume?.analysis?.skills ? 
        (latestResume.analysis.skills.technical?.length || 0) + 
        (latestResume.analysis.skills.soft?.length || 0) : 0
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return {
      latestResume: null,
      applicationStats: { totalApplications: 0 },
      recentApplications: [],
      skillCount: 0
    };
  }
};

const generateCareerAdvice = async (userMessage, conversation) => {
  try {
    // Build context for the AI
    const context = conversation.context;
    const recentMessages = conversation.messages.slice(-10); // Last 10 messages for context

    // Create system prompt with user context
    const systemPrompt = createSystemPrompt(context);
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return generateFallbackResponse(userMessage, context);
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content.trim();

  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackResponse(userMessage, conversation.context);
  }
};

const createSystemPrompt = (context) => {
  const { latestResume, applicationStats, recentApplications } = context;

  let prompt = `You are a professional career advisor AI assistant for Career Boost AI. You provide personalized career guidance, resume advice, job search strategies, and interview preparation help.

CONTEXT ABOUT THE USER:
`;

  if (latestResume) {
    prompt += `- Resume: "${latestResume.fileName}" analyzed on ${new Date(latestResume.analyzedAt).toLocaleDateString()}
- ATS Score: ${latestResume.atsScore || 'Not available'}/100
- Skills Identified: ${latestResume.skillCount} skills
`;
  } else {
    prompt += `- No resume uploaded yet
`;
  }

  prompt += `- Job Applications: ${applicationStats.totalApplications} total, ${applicationStats.activeApplications} active
- Interviews: ${applicationStats.interviews} total
- Offers: ${applicationStats.offers} received
`;

  if (recentApplications && recentApplications.length > 0) {
    prompt += `- Recent Applications: ${recentApplications.map(app => 
      `${app.jobDetails.title} at ${app.jobDetails.company.name} (${app.status})`
    ).join(', ')}
`;
  }

  prompt += `
GUIDELINES:
- Provide specific, actionable advice based on the user's context
- Be encouraging and supportive while being realistic
- Focus on career development, job search strategies, resume improvement, and interview skills
- If the user hasn't uploaded a resume, encourage them to do so for personalized advice
- Reference their application history and progress when relevant
- Keep responses concise but helpful (under 400 words)
- Use a friendly, professional tone
- If asked about topics outside career advice, politely redirect to career-related topics

CAPABILITIES YOU CAN REFERENCE:
- Resume analysis and ATS scoring
- Job matching and recommendations
- Skill gap analysis and learning paths
- Application tracking and interview preparation
- Career progression planning

Respond to the user's question with personalized advice based on their context.`;

  return prompt;
};

const generateFallbackResponse = (userMessage, context) => {
  const message = userMessage.toLowerCase();
  
  // Resume-related responses
  if (message.includes('resume') || message.includes('cv')) {
    if (!context.latestResume) {
      return "I'd love to help you with your resume! To provide personalized advice, I recommend uploading your resume first using our Resume Analyzer. This will give me insights into your skills, experience, and ATS compatibility so I can offer specific improvement suggestions.";
    } else {
      return `Based on your resume "${context.latestResume.fileName}" with an ATS score of ${context.latestResume.atsScore}/100, I can help you improve it further. What specific aspect would you like to work on - formatting, keywords, or content structure?`;
    }
  }
  
  // Job search responses
  if (message.includes('job') || message.includes('application') || message.includes('interview')) {
    if (context.applicationStats.totalApplications === 0) {
      return "Starting your job search can feel overwhelming, but you're in the right place! I recommend beginning with our job recommendations feature after uploading your resume. This will help you find positions that match your skills and experience level.";
    } else {
      return `I see you've applied to ${context.applicationStats.totalApplications} positions with ${context.applicationStats.interviews} interviews. That's great progress! How can I help you with your current applications or job search strategy?`;
    }
  }
  
  // Skills-related responses
  if (message.includes('skill') || message.includes('learn') || message.includes('improve')) {
    return "Developing your skills is crucial for career growth! Our platform can analyze your current skills and identify gaps based on your target roles. Have you checked out the Learning Hub for personalized learning recommendations?";
  }
  
  // Interview responses
  if (message.includes('interview')) {
    return "Interview preparation is key to success! I can help you prepare by discussing common questions, behavioral interview techniques, and how to showcase your experience effectively. What type of interview are you preparing for?";
  }
  
  // Salary/negotiation responses
  if (message.includes('salary') || message.includes('negotiate') || message.includes('offer')) {
    return "Salary negotiation is an important skill! Research market rates for your role and location, prepare your value proposition based on your skills and experience, and remember that negotiation often includes benefits beyond base salary. What specific aspect of negotiation would you like to discuss?";
  }
  
  // Career change responses
  if (message.includes('career change') || message.includes('transition')) {
    return "Career transitions can be exciting opportunities for growth! The key is identifying transferable skills, understanding your target industry's requirements, and creating a strategic plan. What field are you considering transitioning to?";
  }
  
  // Default response
  return "I'm here to help with your career development! I can assist with resume optimization, job search strategies, interview preparation, skill development, and career planning. What specific career challenge are you facing today?";
};

const cleanupOldConversations = (userId) => {
  try {
    const userConversations = Array.from(conversations.entries())
      .filter(([_, conv]) => conv.userId === userId)
      .sort(([_, a], [__, b]) => new Date(b.createdAt) - new Date(a.createdAt));

    // Keep only the 20 most recent conversations per user
    if (userConversations.length > 20) {
      const toDelete = userConversations.slice(20);
      toDelete.forEach(([convId, _]) => {
        conversations.delete(convId);
      });
    }
  } catch (error) {
    console.error('Error cleaning up conversations:', error);
  }
};

module.exports = {
  chatWithCareerAdvisor,
  getConversationHistory,
  getUserConversations,
  deleteConversation
};
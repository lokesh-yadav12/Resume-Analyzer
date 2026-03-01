import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X,
  RotateCcw,
  Trash2,
  Clock
} from 'lucide-react';
import Button from '../common/Button';
import axios from 'axios';

const CareerChatbot = ({ isOpen, onToggle, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI career advisor. I can help you with resume optimization, job search strategies, interview preparation, and career planning. How can I assist you today?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat/career-advisor', {
        message: userMessage,
        conversationId
      });

      if (response.data.success) {
        // Add AI response to chat
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationId(response.data.data.conversationId);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI career advisor. I can help you with resume optimization, job search strategies, interview preparation, and career planning. How can I assist you today?",
      timestamp: new Date()
    }]);
    setConversationId(null);
    setError(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickQuestions = [
    "How can I improve my resume?",
    "What should I include in a cover letter?",
    "How do I prepare for interviews?",
    "What skills should I learn for my career?",
    "How do I negotiate salary?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => sendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 ${className}`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Career Advisor</h3>
            <p className="text-xs opacity-90">AI-powered career guidance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.isError 
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 opacity-70 flex items-center ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Questions (show when conversation is new) */}
        {messages.length <= 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-500 text-center">Quick questions to get started:</p>
            <div className="space-y-1">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your career..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={1}
              style={{ minHeight: '38px', maxHeight: '100px' }}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses may not always be accurate. Use your judgment.
        </p>
      </div>
    </motion.div>
  );
};

export default CareerChatbot;
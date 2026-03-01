import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Phone, 
  FileText, 
  Palette, 
  BarChart3, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const ATSBreakdownCards = ({ breakdown, suggestions = [], className = '' }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  // Configuration for each breakdown category
  const categoryConfig = {
    keywordMatch: {
      icon: Target,
      title: 'Keyword Match',
      maxScore: 40,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      description: 'How well your resume matches job requirements and industry keywords',
      tips: [
        'Include relevant keywords from job descriptions',
        'Use industry-specific terminology',
        'Add action verbs like "developed", "implemented", "managed"',
        'Match technical skills mentioned in job postings'
      ],
      scoreRanges: {
        excellent: { min: 35, color: '#22c55e', label: 'Excellent keyword optimization' },
        good: { min: 28, color: '#3b82f6', label: 'Good keyword usage' },
        fair: { min: 20, color: '#eab308', label: 'Needs more relevant keywords' },
        poor: { min: 0, color: '#ef4444', label: 'Insufficient keyword matching' }
      }
    },
    contactInfo: {
      icon: Phone,
      title: 'Contact Information',
      maxScore: 15,
      color: '#10b981',
      bgColor: '#ecfdf5',
      description: 'Completeness and accessibility of your contact details',
      tips: [
        'Include professional email address',
        'Add phone number with proper formatting',
        'Include LinkedIn profile URL',
        'Add location (city, state) if relevant'
      ],
      scoreRanges: {
        excellent: { min: 14, color: '#22c55e', label: 'Complete contact information' },
        good: { min: 10, color: '#3b82f6', label: 'Most contact info present' },
        fair: { min: 5, color: '#eab308', label: 'Missing some contact details' },
        poor: { min: 0, color: '#ef4444', label: 'Incomplete contact information' }
      }
    },
    structure: {
      icon: FileText,
      title: 'Structure & Organization',
      maxScore: 20,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      description: 'How well your resume is organized with clear sections and formatting',
      tips: [
        'Use clear section headers (EXPERIENCE, EDUCATION, SKILLS)',
        'Organize content with bullet points',
        'Maintain consistent date formatting',
        'Include all essential resume sections'
      ],
      scoreRanges: {
        excellent: { min: 18, color: '#22c55e', label: 'Well-structured resume' },
        good: { min: 14, color: '#3b82f6', label: 'Good organization' },
        fair: { min: 10, color: '#eab308', label: 'Needs better structure' },
        poor: { min: 0, color: '#ef4444', label: 'Poor organization' }
      }
    },
    formatting: {
      icon: Palette,
      title: 'Formatting Quality',
      maxScore: 15,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      description: 'Professional appearance, readability, and ATS-friendly formatting',
      tips: [
        'Keep resume to 1-2 pages (400-800 words)',
        'Use consistent bullet points and spacing',
        'Avoid excessive capitalization',
        'Maintain professional font and layout'
      ],
      scoreRanges: {
        excellent: { min: 13, color: '#22c55e', label: 'Professional formatting' },
        good: { min: 10, color: '#3b82f6', label: 'Good formatting' },
        fair: { min: 7, color: '#eab308', label: 'Formatting needs improvement' },
        poor: { min: 0, color: '#ef4444', label: 'Poor formatting' }
      }
    },
    quantifiable: {
      icon: BarChart3,
      title: 'Quantifiable Achievements',
      maxScore: 10,
      color: '#ef4444',
      bgColor: '#fef2f2',
      description: 'Measurable accomplishments with specific numbers and results',
      tips: [
        'Add specific percentages (e.g., "Increased sales by 25%")',
        'Include dollar amounts and cost savings',
        'Mention team sizes and project scales',
        'Use concrete numbers for achievements'
      ],
      scoreRanges: {
        excellent: { min: 8, color: '#22c55e', label: 'Rich in quantifiable achievements' },
        good: { min: 6, color: '#3b82f6', label: 'Some measurable results' },
        fair: { min: 3, color: '#eab308', label: 'Few quantifiable achievements' },
        poor: { min: 0, color: '#ef4444', label: 'Lacks measurable results' }
      }
    }
  };

  const getScoreLevel = (score, maxScore, ranges) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return ranges.excellent;
    if (percentage >= 70) return ranges.good;
    if (percentage >= 50) return ranges.fair;
    return ranges.poor;
  };

  const toggleCard = (cardKey) => {
    setExpandedCard(expandedCard === cardKey ? null : cardKey);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(categoryConfig).map(([key, config], index) => {
        const score = breakdown[key] || 0;
        const percentage = (score / config.maxScore) * 100;
        const scoreLevel = getScoreLevel(score, config.maxScore, config.scoreRanges);
        const isExpanded = expandedCard === key;
        const IconComponent = config.icon;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Card Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCard(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <IconComponent 
                      className="w-5 h-5"
                      style={{ color: config.color }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">{config.title}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-lg" style={{ color: scoreLevel.color }}>
                      {score.toFixed(1)}/{config.maxScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: scoreLevel.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: scoreLevel.color }}
                  >
                    {scoreLevel.label}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {percentage >= 85 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : percentage >= 50 ? (
                      <Info className="w-4 h-4 text-blue-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-4 space-y-4">
                    {/* Improvement Tips */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <h5 className="font-semibold text-gray-900">Improvement Tips</h5>
                      </div>
                      
                      <div className="space-y-2">
                        {config.tips.map((tip, tipIndex) => (
                          <motion.div
                            key={tipIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: tipIndex * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <div 
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-sm text-gray-700">{tip}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Score Ranges */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Score Ranges</h5>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(config.scoreRanges).map(([level, range]) => (
                          <div 
                            key={level}
                            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: range.color }}
                            />
                            <div>
                              <div className="text-xs font-medium text-gray-900">
                                {range.min}+ pts
                              </div>
                              <div className="text-xs text-gray-600 capitalize">
                                {level}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      
      {/* Overall Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Priority Improvements</h4>
          </div>
          
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-blue-800">{suggestion}</span>
              </motion.div>
            ))}
          </div>
          
          {suggestions.length > 3 && (
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all {suggestions.length} suggestions →
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ATSBreakdownCards;
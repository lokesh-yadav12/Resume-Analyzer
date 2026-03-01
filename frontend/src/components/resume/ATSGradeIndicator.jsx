import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

const ATSGradeIndicator = ({ 
  grade, 
  score, 
  size = 'md', 
  showDescription = true, 
  showRecommendations = false,
  className = '' 
}) => {
  // Grade configurations
  const gradeConfig = {
    'A+': {
      color: '#22c55e',
      bgColor: '#dcfce7',
      borderColor: '#16a34a',
      textColor: 'text-green-700',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      icon: Award,
      description: 'Excellent ATS compatibility',
      range: '90-100',
      recommendations: [
        'Your resume is highly optimized for ATS systems',
        'Focus on tailoring keywords for specific jobs',
        'Consider A/B testing different versions'
      ]
    },
    'A': {
      color: '#16a34a',
      bgColor: '#dcfce7',
      borderColor: '#15803d',
      textColor: 'text-green-600',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      icon: CheckCircle,
      description: 'Very good ATS compatibility',
      range: '85-89',
      recommendations: [
        'Add a few more quantifiable achievements',
        'Consider minor keyword optimization',
        'Review formatting consistency'
      ]
    },
    'B': {
      color: '#eab308',
      bgColor: '#fef3c7',
      borderColor: '#ca8a04',
      textColor: 'text-yellow-700',
      bgClass: 'bg-yellow-50',
      borderClass: 'border-yellow-200',
      icon: TrendingUp,
      description: 'Good ATS compatibility',
      range: '75-84',
      recommendations: [
        'Improve section structure and formatting',
        'Add more relevant keywords and achievements',
        'Enhance contact information completeness'
      ]
    },
    'C': {
      color: '#f59e0b',
      bgColor: '#fed7aa',
      borderColor: '#d97706',
      textColor: 'text-orange-700',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
      icon: AlertCircle,
      description: 'Fair ATS compatibility',
      range: '65-74',
      recommendations: [
        'Significant improvements needed in multiple areas',
        'Focus on contact info, keywords, and structure',
        'Add measurable achievements with numbers'
      ]
    },
    'D': {
      color: '#ef4444',
      bgColor: '#fecaca',
      borderColor: '#dc2626',
      textColor: 'text-red-700',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      icon: XCircle,
      description: 'Poor ATS compatibility',
      range: '0-64',
      recommendations: [
        'Major overhaul needed',
        'Start with basic structure and contact information',
        'Focus on fundamental resume formatting'
      ]
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-3',
      grade: 'text-2xl',
      score: 'text-sm',
      icon: 'w-5 h-5',
      description: 'text-xs'
    },
    md: {
      container: 'p-4',
      grade: 'text-3xl',
      score: 'text-base',
      icon: 'w-6 h-6',
      description: 'text-sm'
    },
    lg: {
      container: 'p-6',
      grade: 'text-4xl',
      score: 'text-lg',
      icon: 'w-8 h-8',
      description: 'text-base'
    }
  };

  const config = gradeConfig[grade] || gradeConfig['D'];
  const sizes = sizeConfig[size];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${config.bgClass} ${config.borderClass} ${sizes.container}
        border-2 rounded-xl shadow-sm
        ${className}
      `}
    >
      {/* Header with Grade and Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: config.bgColor }}
          >
            <IconComponent 
              className={`${sizes.icon}`}
              style={{ color: config.color }}
            />
          </div>
          
          <div>
            <div className={`font-bold ${sizes.grade} ${config.textColor}`}>
              {grade}
            </div>
            {score !== undefined && (
              <div className={`${sizes.score} text-gray-600`}>
                {Math.round(score)}/100
              </div>
            )}
          </div>
        </div>
        
        {/* Score Range Badge */}
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: config.bgColor,
            color: config.color
          }}
        >
          {config.range}
        </div>
      </div>

      {/* Description */}
      {showDescription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${config.textColor} ${sizes.description} font-medium mb-3`}
        >
          {config.description}
        </motion.div>
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className={`${sizes.description} font-semibold ${config.textColor} mb-2`}>
            Recommendations:
          </div>
          
          {config.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <div 
                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className={`${sizes.description} text-gray-700`}>
                {recommendation}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// Grade Legend Component
export const ATSGradeLegend = ({ className = '' }) => {
  const grades = ['A+', 'A', 'B', 'C', 'D'];
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h4 className="font-semibold text-gray-900 mb-3">ATS Grade Scale</h4>
      
      <div className="space-y-2">
        {grades.map((grade, index) => (
          <motion.div
            key={grade}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ATSGradeIndicator 
              grade={grade} 
              size="sm" 
              showDescription={true}
              showRecommendations={false}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ATSGradeIndicator;
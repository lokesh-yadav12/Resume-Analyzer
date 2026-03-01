import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Award } from 'lucide-react';

const ATSScoreCard = ({ atsScore, className = '' }) => {
  if (!atsScore) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const { totalScore, breakdown, grade, suggestions } = atsScore;

  // Determine color scheme based on score
  const getScoreColor = (score) => {
    if (score >= 90) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'stroke-green-500' };
    if (score >= 80) return { bg: 'bg-blue-500', text: 'text-blue-600', ring: 'stroke-blue-500' };
    if (score >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'stroke-yellow-500' };
    if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'stroke-orange-500' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'stroke-red-500' };
  };

  const scoreColor = getScoreColor(totalScore);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  const getGradeIcon = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return <Award className="w-6 h-6 text-green-600" />;
      case 'B':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'C':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const breakdownItems = [
    { key: 'keywordMatch', label: 'Keyword Match', max: 40, icon: '🎯' },
    { key: 'contactInfo', label: 'Contact Info', max: 15, icon: '📞' },
    { key: 'structure', label: 'Structure', max: 20, icon: '📋' },
    { key: 'formatting', label: 'Formatting', max: 15, icon: '✨' },
    { key: 'quantifiable', label: 'Achievements', max: 10, icon: '📊' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">ATS Compatibility Score</h3>
        <div className="flex items-center space-x-2">
          {getGradeIcon(grade)}
          <span className={`text-2xl font-bold ${scoreColor.text}`}>{grade}</span>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={scoreColor.ring}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className={`text-3xl font-bold ${scoreColor.text}`}
              >
                {Math.round(totalScore)}
              </motion.div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Score Breakdown
        </h4>
        
        {breakdownItems.map((item, index) => {
          const score = breakdown[item.key] || 0;
          const percentage = (score / item.max) * 100;
          
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {score.toFixed(1)}/{item.max}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getScoreColor(percentage).bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.2 * index, duration: 0.8 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t pt-4"
        >
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
            Improvement Suggestions
          </h4>
          
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + 0.1 * index }}
                className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">{suggestion}</p>
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
    </motion.div>
  );
};

export default ATSScoreCard;
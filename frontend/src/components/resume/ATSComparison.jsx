import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  FileText,
  BarChart3,
  Award,
  RefreshCw
} from 'lucide-react';
import ATSCircularGauge from './ATSCircularGauge';
import ATSGradeIndicator from './ATSGradeIndicator';

const ATSComparison = ({ 
  beforeData, 
  afterData, 
  onRefresh,
  className = '' 
}) => {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'

  if (!beforeData || !afterData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Comparison Data Available
          </h3>
          <p className="text-gray-600">
            Upload and analyze multiple resume versions to see improvements.
          </p>
        </div>
      </div>
    );
  }

  const scoreDifference = afterData.totalScore - beforeData.totalScore;
  const improvementPercentage = ((scoreDifference / beforeData.totalScore) * 100);

  const getImprovementIcon = (diff) => {
    if (diff > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (diff < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getImprovementColor = (diff) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const breakdownCategories = [
    { key: 'keywordMatch', label: 'Keywords', max: 40, icon: '🎯' },
    { key: 'contactInfo', label: 'Contact', max: 15, icon: '📞' },
    { key: 'structure', label: 'Structure', max: 20, icon: '📋' },
    { key: 'formatting', label: 'Formatting', max: 15, icon: '✨' },
    { key: 'quantifiable', label: 'Achievements', max: 10, icon: '📊' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              ATS Score Comparison
            </h3>
            <p className="text-gray-600 mt-1">
              Compare your resume improvements over time
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'overview' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'detailed' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed
              </button>
            </div>
            
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh comparison"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'overview' ? (
          /* Overview Mode */
          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Before */}
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Before
                </h4>
                <ATSCircularGauge 
                  score={beforeData.totalScore} 
                  size="md" 
                  animated={false}
                />
                <div className="mt-3">
                  <ATSGradeIndicator 
                    grade={beforeData.grade} 
                    score={beforeData.totalScore}
                    size="sm"
                    showDescription={false}
                  />
                </div>
                {beforeData.date && (
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(beforeData.date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Arrow & Improvement */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4"
                >
                  <ArrowRight className="w-8 h-8 text-blue-600" />
                </motion.div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getImprovementColor(scoreDifference)}`}>
                    {scoreDifference > 0 ? '+' : ''}{scoreDifference.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                  
                  {Math.abs(improvementPercentage) > 0.1 && (
                    <div className={`text-sm font-medium ${getImprovementColor(scoreDifference)} flex items-center justify-center mt-1`}>
                      {getImprovementIcon(scoreDifference)}
                      <span className="ml-1">
                        {Math.abs(improvementPercentage).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* After */}
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  After
                </h4>
                <ATSCircularGauge 
                  score={afterData.totalScore} 
                  size="md" 
                  animated={true}
                />
                <div className="mt-3">
                  <ATSGradeIndicator 
                    grade={afterData.grade} 
                    score={afterData.totalScore}
                    size="sm"
                    showDescription={false}
                  />
                </div>
                {afterData.date && (
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(afterData.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Key Improvements */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-600" />
                Key Improvements
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breakdownCategories.map((category) => {
                  const beforeScore = beforeData.breakdown[category.key] || 0;
                  const afterScore = afterData.breakdown[category.key] || 0;
                  const diff = afterScore - beforeScore;
                  
                  if (Math.abs(diff) < 0.1) return null;
                  
                  return (
                    <motion.div
                      key={category.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-900">{category.label}</span>
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${getImprovementColor(diff)}`}>
                        {getImprovementIcon(diff)}
                        <span className="font-semibold">
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Mode */
          <div className="space-y-6">
            {/* Detailed Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Detailed Score Breakdown</h4>
              
              <div className="space-y-4">
                {breakdownCategories.map((category, index) => {
                  const beforeScore = beforeData.breakdown[category.key] || 0;
                  const afterScore = afterData.breakdown[category.key] || 0;
                  const diff = afterScore - beforeScore;
                  const beforePercentage = (beforeScore / category.max) * 100;
                  const afterPercentage = (afterScore / category.max) * 100;
                  
                  return (
                    <motion.div
                      key={category.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.label}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Before</div>
                            <div className="font-semibold">{beforeScore.toFixed(1)}/{category.max}</div>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-600">After</div>
                            <div className="font-semibold">{afterScore.toFixed(1)}/{category.max}</div>
                          </div>
                          
                          <div className={`text-right ${getImprovementColor(diff)}`}>
                            <div className="text-sm">Change</div>
                            <div className="font-semibold flex items-center">
                              {getImprovementIcon(diff)}
                              <span className="ml-1">
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Before</span>
                            <span>{Math.round(beforePercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gray-400 rounded-full transition-all duration-500"
                              style={{ width: `${beforePercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>After</span>
                            <span>{Math.round(afterPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className={`h-2 rounded-full ${
                                diff > 0 ? 'bg-green-500' : diff < 0 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              initial={{ width: `${beforePercentage}%` }}
                              animate={{ width: `${afterPercentage}%` }}
                              transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Improvement Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Improvement Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {scoreDifference > 0 ? '+' : ''}{scoreDifference.toFixed(1)}
                  </div>
                  <div className="text-sm text-blue-800">Total Points</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.abs(improvementPercentage).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">
                    {scoreDifference >= 0 ? 'Improvement' : 'Decrease'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {afterData.grade}
                  </div>
                  <div className="text-sm text-blue-800">Current Grade</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSComparison;
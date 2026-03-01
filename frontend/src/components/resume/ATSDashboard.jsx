import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  RefreshCw,
  Download,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';
import ATSCircularGauge from './ATSCircularGauge';
import ATSGradeIndicator, { ATSGradeLegend } from './ATSGradeIndicator';
import ATSBreakdownCards from './ATSBreakdownCards';
import ATSComparison from './ATSComparison';
import ATSScoreCard from './ATSScoreCard';

const ATSDashboard = ({ 
  resumeData, 
  comparisonData,
  onRefresh,
  onDownloadReport,
  onShareResults,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLegend, setShowLegend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'breakdown', label: 'Detailed Analysis', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: Award }
  ];

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        await onRefresh();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!resumeData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No ATS Analysis Available
          </h3>
          <p className="text-gray-600 mb-6">
            Upload and analyze your resume to see ATS compatibility scores and recommendations.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  const { atsScore } = resumeData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ATS Analysis Dashboard
            </h2>
            <p className="text-gray-600">
              Comprehensive analysis of your resume's ATS compatibility
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            {/* Legend Toggle */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showLegend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">Legend</span>
            </button>
            
            {/* Share Button */}
            {onShareResults && (
              <button
                onClick={onShareResults}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            )}
            
            {/* Download Report */}
            {onDownloadReport && (
              <button
                onClick={onDownloadReport}
                className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Report</span>
              </button>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend (Collapsible) */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ATSGradeLegend />
        </motion.div>
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Score Card */}
            <div className="lg:col-span-2">
              <ATSScoreCard atsScore={atsScore} />
            </div>
            
            {/* Grade Indicator */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Grade
                </h3>
                <ATSGradeIndicator 
                  grade={atsScore.grade}
                  score={atsScore.totalScore}
                  size="lg"
                  showDescription={true}
                  showRecommendations={false}
                />
              </div>
              
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Score</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(atsScore.totalScore)}/100
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Grade</span>
                    <span className="font-semibold text-gray-900">
                      {atsScore.grade}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Top Category</span>
                    <span className="font-semibold text-gray-900">
                      {Object.entries(atsScore.breakdown)
                        .sort(([,a], [,b]) => b - a)[0][0]
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Suggestions</span>
                    <span className="font-semibold text-gray-900">
                      {atsScore.suggestions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'breakdown' && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ATSBreakdownCards 
              breakdown={atsScore.breakdown}
              suggestions={atsScore.suggestions}
            />
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ATSComparison 
              beforeData={comparisonData?.before}
              afterData={comparisonData?.after || {
                totalScore: atsScore.totalScore,
                grade: atsScore.grade,
                breakdown: atsScore.breakdown,
                date: new Date().toISOString()
              }}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ATSDashboard;
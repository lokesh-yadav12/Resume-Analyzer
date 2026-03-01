import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LearningPath from '../components/learning/LearningPath';
import { BookOpen, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import axios from 'axios';

const LearningHub = () => {
  const { user } = useAuth();
  const [skillGapData, setSkillGapData] = useState(null);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch skill gap analysis and trending skills in parallel
      const [skillGapResponse, trendingResponse] = await Promise.all([
        axios.get('/api/skills/gap-analysis').catch(() => ({ data: { success: false } })),
        axios.get('/api/skills/trending').catch(() => ({ data: { success: false, data: { trendingSkills: [] } } }))
      ]);

      if (skillGapResponse.data.success) {
        setSkillGapData(skillGapResponse.data.data);
      }

      if (trendingResponse.data.success) {
        setTrendingSkills(trendingResponse.data.data.trendingSkills || []);
      }

    } catch (err) {
      console.error('Error fetching learning data:', err);
      setError('Failed to load learning recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLearning = (recommendation) => {
    // Track learning start
    console.log('Starting learning for:', recommendation.skill);
    
    // Open first resource or redirect to learning platform
    if (recommendation.resources && recommendation.resources.length > 0) {
      window.open(recommendation.resources[0].url, '_blank');
    }
  };

  const handleMarkComplete = (skillName, stepIndex, isCompleted) => {
    // Track learning progress
    console.log(`Marked step ${stepIndex} for ${skillName} as ${isCompleted ? 'completed' : 'incomplete'}`);
    
    // Here you would typically save progress to backend
    // await axios.post('/api/learning/progress', { skillName, stepIndex, isCompleted });
  };

  if (!user?.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please verify your email address to access learning recommendations.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/profile'}
          >
            Go to Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
                  Learning Hub
                </h1>
                <p className="text-gray-600 mt-2">
                  Personalized learning paths to advance your career
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/resume-analyzer'}
                >
                  Analyze Resume
                </Button>
                <Button
                  variant="primary"
                  onClick={fetchLearningData}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing Your Skills
            </h3>
            <p className="text-gray-600">
              Generating personalized learning recommendations...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Learning Data
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={fetchLearningData}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* No Resume State */}
        {!isLoading && !error && !skillGapData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Get Personalized Learning Recommendations
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Upload and analyze your resume to receive tailored learning paths 
              that will help you land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/resume-analyzer'}
                icon={<Target className="w-5 h-5" />}
              >
                Analyze My Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/job-recommendations'}
              >
                Browse Jobs
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isLoading && !error && skillGapData && (
          <div className="space-y-8">
            {/* Skill Gap Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Coverage</h3>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.round(skillGapData.skillGapAnalysis?.skillCoverage?.coveragePercentage || 0)}%
                </div>
                <p className="text-sm text-gray-600">
                  {skillGapData.skillGapAnalysis?.skillCoverage?.matched || 0} of{' '}
                  {skillGapData.skillGapAnalysis?.skillCoverage?.total || 0} skills matched
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills to Learn</h3>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {skillGapData.learningRecommendations?.length || 0}
                </div>
                <p className="text-sm text-gray-600">
                  Recommended for career growth
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Time</h3>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {skillGapData.learningRecommendations?.reduce((sum, rec) => sum + (rec.estimatedTime || 0), 0) || 0}h
                </div>
                <p className="text-sm text-gray-600">
                  Estimated total time
                </p>
              </div>
            </motion.div>

            {/* Learning Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LearningPath
                learningRecommendations={skillGapData.learningRecommendations || []}
                onStartLearning={handleStartLearning}
                onMarkComplete={handleMarkComplete}
              />
            </motion.div>

            {/* Trending Skills */}
            {trendingSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Trending Skills in Your Industry
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {trendingSkills.slice(0, 10).map((skill, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {skill.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {skill.demandLevel} Demand
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        +{skill.growthRate}%
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white text-center"
            >
              <h3 className="text-xl font-semibold mb-2">🚀 Ready to Level Up?</h3>
              <p className="mb-4 opacity-90">
                Start with the highest priority skills to maximize your career impact
              </p>
              <Button
                variant="outline"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => {
                  const firstRecommendation = skillGapData.learningRecommendations?.[0];
                  if (firstRecommendation) {
                    handleStartLearning(firstRecommendation);
                  }
                }}
              >
                Start Learning Now
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
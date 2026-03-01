import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  CheckCircle, 
  Circle, 
  Play,
  ExternalLink,
  Target,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  Zap
} from 'lucide-react';
import Button from '../common/Button';

const LearningPath = ({ 
  learningRecommendations = [], 
  onStartLearning,
  onMarkComplete,
  className = '' 
}) => {
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 80) return 'text-red-600 bg-red-100';
    if (priority >= 60) return 'text-orange-600 bg-orange-100';
    if (priority >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 80) return 'Critical';
    if (priority >= 60) return 'High';
    if (priority >= 40) return 'Medium';
    return 'Low';
  };

  const formatTime = (hours) => {
    if (hours < 24) return `${hours} hours`;
    const days = Math.ceil(hours / 8); // 8 hours per day
    if (days < 7) return `${days} days`;
    const weeks = Math.ceil(days / 7);
    return `${weeks} weeks`;
  };

  const handleStepComplete = (skillName, stepIndex) => {
    const stepKey = `${skillName}-${stepIndex}`;
    const newCompleted = new Set(completedSteps);
    
    if (completedSteps.has(stepKey)) {
      newCompleted.delete(stepKey);
    } else {
      newCompleted.add(stepKey);
    }
    
    setCompletedSteps(newCompleted);
    onMarkComplete?.(skillName, stepIndex, !completedSteps.has(stepKey));
  };

  const getCompletionPercentage = (skill) => {
    const totalSteps = skill.learningPath?.length || 0;
    if (totalSteps === 0) return 0;
    
    const completedCount = skill.learningPath.filter((_, index) => 
      completedSteps.has(`${skill.skill}-${index}`)
    ).length;
    
    return Math.round((completedCount / totalSteps) * 100);
  };

  if (learningRecommendations.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Learning Recommendations
        </h3>
        <p className="text-gray-600">
          Complete a skill gap analysis to get personalized learning recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-500" />
              Learning Roadmap
            </h2>
            <p className="text-gray-600 mt-1">
              Personalized learning paths to bridge your skill gaps
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Skills to Learn</div>
            <div className="text-2xl font-bold text-blue-600">
              {learningRecommendations.length}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="space-y-4">
        {learningRecommendations.map((recommendation, index) => {
          const isExpanded = expandedSkill === recommendation.skill;
          const completionPercentage = getCompletionPercentage(recommendation);
          
          return (
            <motion.div
              key={recommendation.skill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Skill Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedSkill(isExpanded ? null : recommendation.skill)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.skill}
                      </h3>
                      
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {getPriorityLabel(recommendation.priority)} Priority
                      </span>
                      
                      {/* Category Badge */}
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {recommendation.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(recommendation.estimatedTime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span className={getDifficultyColor(recommendation.difficulty).split(' ')[0]}>
                          {recommendation.difficulty}
                        </span>
                      </div>
                      
                      {completionPercentage > 0 && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">{completionPercentage}% Complete</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {completionPercentage > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartLearning?.(recommendation);
                      }}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Start Learning
                    </Button>
                    
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
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
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Prerequisites */}
                      {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-orange-500" />
                            Prerequisites
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.prerequisites.map((prereq, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                              >
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Path */}
                      {recommendation.learningPath && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                            Learning Path
                          </h4>
                          <div className="space-y-3">
                            {recommendation.learningPath.map((step, stepIndex) => {
                              const stepKey = `${recommendation.skill}-${stepIndex}`;
                              const isCompleted = completedSteps.has(stepKey);
                              
                              return (
                                <motion.div
                                  key={stepIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: stepIndex * 0.1 }}
                                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                    isCompleted 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  <button
                                    onClick={() => handleStepComplete(recommendation.skill, stepIndex)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 hover:border-green-400'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Circle className="w-4 h-4" />
                                    )}
                                  </button>
                                  
                                  <div className="flex-1">
                                    <span className={`text-sm ${
                                      isCompleted ? 'text-green-800 line-through' : 'text-gray-700'
                                    }`}>
                                      {step}
                                    </span>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500">
                                    Step {stepIndex + 1}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Learning Resources */}
                      {recommendation.resources && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                            Recommended Resources
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendation.resources.map((resource, resourceIndex) => (
                              <motion.div
                                key={resourceIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: resourceIndex * 0.1 }}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 text-sm line-clamp-2">
                                      {resource.title}
                                    </h5>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {resource.provider}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    resource.type === 'Course' ? 'bg-blue-100 text-blue-800' :
                                    resource.type === 'Documentation' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {resource.type}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                  <span>{resource.duration}</span>
                                  <span className="font-medium">{resource.cost}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-600">{resource.rating}</span>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="text-xs px-2 py-1"
                                  >
                                    View
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">🎯 Your Learning Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {learningRecommendations.reduce((sum, rec) => sum + rec.estimatedTime, 0)}
            </div>
            <div className="text-sm opacity-90">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {learningRecommendations.filter(rec => rec.difficulty === 'Easy').length}
            </div>
            <div className="text-sm opacity-90">Easy Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {learningRecommendations.filter(rec => rec.priority >= 60).length}
            </div>
            <div className="text-sm opacity-90">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
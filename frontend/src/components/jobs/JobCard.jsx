import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign, 
  Heart, 
  ExternalLink,
  Star,
  Briefcase,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import Button from '../common/Button';

const JobCard = ({ 
  job, 
  matchScore, 
  onSave, 
  onApply, 
  onViewDetails,
  isSaved = false,
  showMatchScore = false,
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave?.(job.id || job._id);
      setSaved(!saved);
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply?.(job);
    // Track application
    if (job.externalUrl || job.external_url) {
      window.open(job.externalUrl || job.external_url, '_blank');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const formatSalary = (salaryRange) => {
    if (typeof salaryRange === 'string') return salaryRange;
    if (!salaryRange) return 'Salary not specified';
    
    const { min, max, currency = 'USD' } = salaryRange;
    if (min && max) {
      return `${currency} ${(min/1000).toFixed(0)}K - ${(max/1000).toFixed(0)}K`;
    } else if (min) {
      return `${currency} ${(min/1000).toFixed(0)}K+`;
    }
    return 'Competitive salary';
  };

  const getWorkModeIcon = (workMode) => {
    switch (workMode?.toLowerCase()) {
      case 'remote': return '🏠';
      case 'hybrid': return '🏢';
      case 'onsite': return '🏢';
      default: return '💼';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {job.company?.logo ? (
                <img 
                  src={job.company.logo} 
                  alt={job.company?.name || job.company} 
                  className="w-8 h-8 rounded"
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {job.company?.name || job.company}
                  </p>
                </div>

                {/* Match Score */}
                {showMatchScore && matchScore && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(matchScore.final_score || matchScore)}`}>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{Math.round(matchScore.final_score || matchScore)}% match</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Location and Work Mode */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.fullLocation || job.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{getWorkModeIcon(job.details?.workMode || job.work_mode)}</span>
                  <span>{job.details?.workMode || job.work_mode || 'Not specified'}</span>
                </div>
              </div>

              {/* Salary and Employment Type */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salaryRangeString || job.salary_range || formatSalary(job.details?.salaryRange)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.details?.employmentType || 'Full-time'}</span>
                </div>
              </div>

              {/* Job Description Preview */}
              {job.shortDescription && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {job.shortDescription}
                </p>
              )}

              {/* Skills Match (if available) */}
              {matchScore?.matched_skills && matchScore.matched_skills.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Matching Skills ({matchScore.matched_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matchScore.matched_skills.slice(0, 4).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {matchScore.matched_skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{matchScore.matched_skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Missing Skills (if available) */}
              {matchScore?.missing_skills && matchScore.missing_skills.length > 0 && matchScore.missing_skills.length <= 3 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Skills to Learn ({matchScore.missing_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matchScore.missing_skills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                      >
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              saved 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Posted Date and Urgency */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {job.daysSincePosted 
                  ? `${job.daysSincePosted} days ago`
                  : 'Recently posted'
                }
              </span>
            </div>
            
            {job.urgency && job.urgency !== 'low' && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                {job.urgency === 'high' ? 'Apply soon' : 'Moderate urgency'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(job)}
            >
              View Details
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Match Explanation */}
        {matchScore?.explanation && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">
              {matchScore.explanation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import JobMatchList from '../components/jobs/JobMatchList';
import { Target, Upload, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import axios from 'axios';

const JobRecommendations = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    fetchJobRecommendations();
  }, []);

  const fetchJobRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/jobs/recommendations');
      
      if (response.data.success) {
        const jobsData = response.data.data.jobs || [];
        
        // Transform jobs to match format
        const transformedMatches = jobsData.map(job => ({
          job_id: job._id || job.id,
          title: job.title,
          company: job.company?.name || job.company,
          location: job.details?.location || job.location || 'Remote',
          work_mode: job.details?.workMode || job.workMode || 'Remote',
          salary_range: job.details?.salaryRange 
            ? `$${(job.details.salaryRange.min/1000).toFixed(0)}K - $${(job.details.salaryRange.max/1000).toFixed(0)}K`
            : 'Competitive',
          external_url: job.externalUrl || job.external_url || '#',
          final_score: job.matchPercentage || 75,
          matched_skills: job.matchedSkills || [],
          missing_skills: job.missingSkills || [],
          daysSincePosted: job.daysSincePosted || 1,
          posted_date: job.postedDate || new Date().toISOString()
        }));
        
        setMatches(transformedMatches);
        
        // Set resume info if available
        if (response.data.data.resumeUsed) {
          setResumeInfo(response.data.data.resumeUsed);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching job recommendations:', err);
      
      if (err.response?.status === 404 || err.response?.data?.error?.includes('resume')) {
        setError('Please upload a resume first to get personalized job recommendations.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load job recommendations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/save`);
      // Could add toast notification here
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApplyJob = (job) => {
    // Track application analytics
    console.log('User applied to job:', job.title);
    
    // Open external application link
    if (job.external_url) {
      window.open(job.external_url, '_blank');
    }
  };

  const handleViewJobDetails = (job) => {
    // Navigate to job details page
    window.location.href = `/jobs/${job.id}`;
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
            Please verify your email address to access job recommendations.
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
                  <Target className="w-8 h-8 mr-3 text-blue-500" />
                  Job Recommendations
                </h1>
                <p className="text-gray-600 mt-2">
                  Personalized job matches based on your resume and preferences
                </p>
                
                {resumeInfo && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Using resume:</strong> {resumeInfo.fileName} 
                      <span className="text-blue-600 ml-2">
                        (analyzed {new Date(resumeInfo.analyzedAt).toLocaleDateString()})
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/resume-analyzer'}
                  icon={<Upload className="w-4 h-4" />}
                >
                  Upload New Resume
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* No Resume State */}
        {error && error.includes('upload a resume') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upload Your Resume to Get Started
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              To provide you with personalized job recommendations, we need to analyze your resume first. 
              Upload your resume and get instant ATS scoring plus tailored job matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/resume-analyzer'}
                icon={<Upload className="w-5 h-5" />}
              >
                Upload Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/jobs'}
              >
                Browse All Jobs
              </Button>
            </div>
          </motion.div>
        )}

        {/* Job Recommendations */}
        {!error || !error.includes('upload a resume') ? (
          <JobMatchList
            matches={matches}
            isLoading={isLoading}
            error={error && !error.includes('upload a resume') ? error : null}
            onRefresh={fetchJobRecommendations}
            onSaveJob={handleSaveJob}
            onApplyJob={handleApplyJob}
            onViewJobDetails={handleViewJobDetails}
            showFilters={true}
          />
        ) : null}

        {/* Tips Section */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Tips to Improve Your Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Update Your Skills</h4>
                <p className="text-sm text-blue-800">
                  Add trending skills to your resume to match with more high-paying positions.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Optimize Keywords</h4>
                <p className="text-sm text-green-800">
                  Include industry-specific keywords that appear in job descriptions you're interested in.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Set Preferences</h4>
                <p className="text-sm text-purple-800">
                  Update your profile preferences for location, salary, and work mode for better matches.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
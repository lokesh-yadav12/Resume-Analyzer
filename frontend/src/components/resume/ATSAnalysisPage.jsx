import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import ATSDashboard from './ATSDashboard';
import UploadResume from './UploadResume';

const ATSAnalysisPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data for demonstration
  const sampleResumeData = {
    id: 'resume-123',
    fileName: 'john_doe_resume.pdf',
    atsScore: {
      totalScore: 78.5,
      breakdown: {
        keywordMatch: 32.5,
        contactInfo: 15,
        structure: 18,
        formatting: 13,
        quantifiable: 8
      },
      grade: 'B',
      suggestions: [
        'Add more quantifiable achievements with specific numbers and percentages',
        'Include more relevant keywords from job descriptions',
        'Improve section structure with clearer headers',
        'Add LinkedIn profile URL to contact information'
      ]
    },
    analyzedAt: new Date().toISOString()
  };

  const sampleComparisonData = {
    before: {
      totalScore: 65.2,
      grade: 'C',
      breakdown: {
        keywordMatch: 25.0,
        contactInfo: 10,
        structure: 15,
        formatting: 12,
        quantifiable: 3.2
      },
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    },
    after: {
      totalScore: 78.5,
      grade: 'B',
      breakdown: {
        keywordMatch: 32.5,
        contactInfo: 15,
        structure: 18,
        formatting: 13,
        quantifiable: 8
      },
      date: new Date().toISOString()
    }
  };

  // Load sample data on component mount
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setResumeData(sampleResumeData);
      setComparisonData(sampleComparisonData);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call your API here
      // const response = await uploadAndAnalyzeResume(file);
      // setResumeData(response.data);
      
      // For demo, just update with sample data
      setResumeData({
        ...sampleResumeData,
        fileName: file.name,
        analyzedAt: new Date().toISOString()
      });
      
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with slightly different scores to show refresh
      const updatedScore = Math.min(100, resumeData.atsScore.totalScore + Math.random() * 5);
      setResumeData({
        ...resumeData,
        atsScore: {
          ...resumeData.atsScore,
          totalScore: updatedScore,
          grade: updatedScore >= 85 ? 'A' : updatedScore >= 75 ? 'B' : updatedScore >= 65 ? 'C' : 'D'
        },
        analyzedAt: new Date().toISOString()
      });
      
    } catch (err) {
      setError('Failed to refresh analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Simulate report download
    const reportData = {
      resumeFileName: resumeData.fileName,
      atsScore: resumeData.atsScore,
      analyzedAt: resumeData.analyzedAt,
      recommendations: resumeData.atsScore.suggestions
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-analysis-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = () => {
    // Simulate sharing functionality
    if (navigator.share) {
      navigator.share({
        title: 'My ATS Analysis Results',
        text: `I scored ${Math.round(resumeData.atsScore.totalScore)}/100 (Grade ${resumeData.atsScore.grade}) on ATS compatibility!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `I scored ${Math.round(resumeData.atsScore.totalScore)}/100 (Grade ${resumeData.atsScore.grade}) on ATS compatibility! Check out Career Boost AI for your resume analysis.`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            ATS Resume Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get detailed insights into how well your resume performs with Applicant Tracking Systems (ATS) 
            and receive personalized recommendations for improvement.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        {!resumeData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <UploadResume 
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !resumeData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center max-w-md mx-auto"
          >
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-ping opacity-20"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Analyzing Your Resume
            </h3>
            <p className="text-gray-600 mb-8">
              Our AI is extracting insights and calculating your ATS compatibility score...
            </p>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  initial={{ width: 0, x: '-100%' }}
                  animate={{ 
                    width: '100%', 
                    x: 0,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Extracting text...</span>
                <span>Analyzing structure...</span>
                <span>Calculating score...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ATS Dashboard */}
        {resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ATSDashboard
              resumeData={resumeData}
              comparisonData={comparisonData}
              onRefresh={handleRefresh}
              onDownloadReport={handleDownloadReport}
              onShareResults={handleShareResults}
            />
          </motion.div>
        )}

        {/* Demo Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Upload className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              This is a demo with sample data. Upload your resume to see real analysis results.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ATSAnalysisPage;
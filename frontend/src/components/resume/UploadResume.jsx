import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import Button from '../common/Button';

const UploadResume = ({ onUploadSuccess, onUploadError, className = '' }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const maxSize = 5 * 1024 * 1024; // 5MB
  const acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File upload failed';
      
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        errorMessage = 'File is too large. Maximum size is 5MB.';
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        errorMessage = 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.';
      }
      
      setError(errorMessage);
      setUploadState('error');
      onUploadError?.(errorMessage);
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setUploadState('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Create form data
      const formData = new FormData();
      formData.append('resume', file);

      // Upload file
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      setAnalysisResult(result.data);
      setUploadState('success');
      onUploadSuccess?.(result.data);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploadState('error');
      onUploadError?.(err.message);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple: false,
    disabled: uploadState === 'uploading'
  });

  const resetUpload = () => {
    setUploadState('idle');
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
  };

  const getDropzoneClasses = () => {
    let classes = 'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ';
    
    if (uploadState === 'uploading') {
      classes += 'border-blue-300 bg-blue-50 cursor-not-allowed ';
    } else if (isDragReject) {
      classes += 'border-red-300 bg-red-50 ';
    } else if (isDragActive) {
      classes += 'border-blue-500 bg-blue-50 ';
    } else {
      classes += 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 ';
    }
    
    return classes;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        {uploadState === 'idle' && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div {...getRootProps()} className={getDropzoneClasses()}>
              <input {...getInputProps()} />
              
              <motion.div
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {isDragReject 
                    ? 'File type not supported' 
                    : 'Drag and drop your resume, or click to browse'
                  }
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">DOCX</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">TXT</span>
                </div>
                
                <p className="text-sm text-gray-500">
                  Maximum file size: 5MB
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {uploadState === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing your resume...
              </h3>
              
              <p className="text-gray-600 mb-4">
                Our AI is extracting insights from your resume
              </p>
              
              {uploadedFile && (
                <div className="flex items-center justify-center space-x-2 mb-4 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{uploadedFile.name}</span>
                  <span>({formatFileSize(uploadedFile.size)})</span>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <p className="text-sm text-gray-500">
                {uploadProgress < 90 ? `${Math.round(uploadProgress)}% uploaded` : 'Processing...'}
              </p>
            </div>
          </motion.div>
        )}

        {uploadState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              </motion.div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analysis Complete!
              </h3>
              
              <p className="text-gray-600 mb-4">
                Your resume has been successfully analyzed
              </p>
              
              {uploadedFile && (
                <div className="flex items-center justify-center space-x-2 mb-6 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{uploadedFile.name}</span>
                  <span>({formatFileSize(uploadedFile.size)})</span>
                </div>
              )}
              
              {analysisResult && (
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">ATS Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(analysisResult.analysis?.atsScore?.totalScore || 0)}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-semibold text-green-900">Skills Found</div>
                    <div className="text-2xl font-bold text-green-600">
                      {(analysisResult.analysis?.skills?.technical?.length || 0) + 
                       (analysisResult.analysis?.skills?.soft?.length || 0)}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => {
                    // Navigate to analysis results
                    window.location.href = `/resume/${analysisResult.resumeId}`;
                  }}
                >
                  View Analysis
                </Button>
                
                <Button
                  variant="outline"
                  icon={<Upload className="w-4 h-4" />}
                  onClick={resetUpload}
                >
                  Upload Another
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {uploadState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Failed
              </h3>
              
              <p className="text-red-600 mb-6">
                {error || 'Something went wrong. Please try again.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={resetUpload}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to help or contact
                    window.location.href = '/help';
                  }}
                >
                  Get Help
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadResume;
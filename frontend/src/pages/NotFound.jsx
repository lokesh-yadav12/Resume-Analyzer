import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-2xl">
              <span className="text-6xl font-bold text-white">404</span>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 mb-8 max-w-md mx-auto"
          >
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved or doesn't exist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <Link
              to="/resume-analyzer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-colors duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Analyze Resume
            </Link>
          </motion.div>

          {/* Popular Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <p className="text-sm text-gray-500 mb-4">Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/resume-analyzer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Resume Analyzer
              </Link>
              <Link to="/job-recommendations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Job Recommendations
              </Link>
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Dashboard
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
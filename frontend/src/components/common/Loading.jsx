import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Loading = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LoadingContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Animated Logo */}
      <div className="relative mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
          <span className="text-white font-bold text-2xl">CB</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-ping opacity-20"></div>
      </div>

      {/* Spinning Loader */}
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mb-4`} />
      
      {/* Loading Text */}
      <p className={`${textSizes[size]} font-medium text-gray-700 mb-2`}>
        {text}
      </p>
      
      {/* Progress Dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default Loading;
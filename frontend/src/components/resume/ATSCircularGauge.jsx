import React from 'react';
import { motion } from 'framer-motion';

const ATSCircularGauge = ({ 
  score = 0, 
  size = 'lg', 
  showLabel = true, 
  showGrade = true,
  animated = true,
  className = '' 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg', radius: 34 },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl', radius: 50 },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-3xl', radius: 70 },
    xl: { width: 200, height: 200, strokeWidth: 12, fontSize: 'text-4xl', radius: 88 }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color and grade logic
  const getScoreData = (score) => {
    if (score >= 90) return { 
      color: '#22c55e', 
      bgColor: '#dcfce7', 
      textColor: 'text-green-600', 
      grade: 'A+',
      description: 'Excellent'
    };
    if (score >= 85) return { 
      color: '#16a34a', 
      bgColor: '#dcfce7', 
      textColor: 'text-green-600', 
      grade: 'A',
      description: 'Very Good'
    };
    if (score >= 75) return { 
      color: '#eab308', 
      bgColor: '#fef3c7', 
      textColor: 'text-yellow-600', 
      grade: 'B',
      description: 'Good'
    };
    if (score >= 65) return { 
      color: '#f59e0b', 
      bgColor: '#fed7aa', 
      textColor: 'text-orange-600', 
      grade: 'C',
      description: 'Fair'
    };
    return { 
      color: '#ef4444', 
      bgColor: '#fecaca', 
      textColor: 'text-red-600', 
      grade: 'D',
      description: 'Poor'
    };
  };

  const scoreData = getScoreData(score);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Circular Gauge */}
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg 
          width={config.width} 
          height={config.height} 
          className="transform -rotate-90"
          viewBox={`0 0 ${config.width} ${config.height}`}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            className="opacity-30"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke={scoreData.color}
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={animated ? strokeDashoffset : circumference - (score / 100) * circumference}
            strokeLinecap="round"
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={animated ? { strokeDashoffset } : false}
            transition={animated ? { duration: 2, ease: "easeOut" } : false}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Gradient definition for enhanced visual */}
          <defs>
            <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scoreData.color} stopOpacity="1" />
              <stop offset="100%" stopColor={scoreData.color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Score */}
            <motion.div
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 1 } : false}
              transition={animated ? { delay: 1, type: "spring", stiffness: 200 } : false}
              className={`font-bold ${config.fontSize} ${scoreData.textColor}`}
            >
              {Math.round(score)}
            </motion.div>
            
            {/* Grade */}
            {showGrade && (
              <motion.div
                initial={animated ? { opacity: 0 } : false}
                animate={animated ? { opacity: 1 } : false}
                transition={animated ? { delay: 1.2 } : false}
                className={`text-sm font-semibold ${scoreData.textColor} mt-1`}
              >
                {scoreData.grade}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Outer glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{ 
            background: `conic-gradient(from 0deg, ${scoreData.color} ${score * 3.6}deg, transparent ${score * 3.6}deg)`,
            transform: 'rotate(-90deg)'
          }}
        />
      </div>
      
      {/* Label */}
      {showLabel && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={animated ? { delay: 1.5 } : false}
          className="mt-4 text-center"
        >
          <div className={`text-lg font-semibold ${scoreData.textColor}`}>
            {scoreData.description}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ATS Compatibility
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ATSCircularGauge;
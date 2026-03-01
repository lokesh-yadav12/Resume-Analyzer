import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ATSAnalysisPage from '../components/resume/ATSAnalysisPage';
import { FileText, TrendingUp, Target, Zap } from 'lucide-react';

const ResumeAnalyzer = () => {
  const { user } = useAuth();

  return <ATSAnalysisPage />;
};

export default ResumeAnalyzer;
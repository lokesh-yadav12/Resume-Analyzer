import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Users, 
  Award,
  Plus,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  // Sample data - in real app this would come from API
  const stats = {
    resumesAnalyzed: 3,
    avgAtsScore: 78,
    jobMatches: 24,
    skillsIdentified: 15
  };

  const recentActivity = [
    {
      type: 'resume',
      title: 'Resume Analysis Completed',
      description: 'Your resume scored 85/100 (Grade A)',
      time: '2 hours ago',
      icon: FileText,
      color: 'blue'
    },
    {
      type: 'job',
      title: 'New Job Matches Found',
      description: '5 new positions match your profile',
      time: '1 day ago',
      icon: Target,
      color: 'green'
    },
    {
      type: 'skill',
      title: 'Skill Gap Analysis',
      description: 'React and Node.js recommended for growth',
      time: '2 days ago',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const quickActions = [
    {
      title: 'Analyze New Resume',
      description: 'Upload and analyze a new resume version',
      icon: FileText,
      color: 'blue',
      link: '/resume-analyzer'
    },
    {
      title: 'Find Job Matches',
      description: 'Discover personalized job recommendations',
      icon: Target,
      color: 'green',
      link: '/job-recommendations'
    },
    {
      title: 'Skill Development',
      description: 'Explore learning paths and courses',
      icon: TrendingUp,
      color: 'purple',
      link: '/learning-hub'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Here's your career development overview and recent activity.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resumes Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.resumesAnalyzed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg ATS Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgAtsScore}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Matches</p>
                <p className="text-3xl font-bold text-gray-900">{stats.jobMatches}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Identified</p>
                <p className="text-3xl font-bold text-gray-900">{stats.skillsIdentified}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.link}
                      className="group p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`w-5 h-5 text-${action.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      <div className="flex items-center mt-2 text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Get started</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-4 h-4 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activity
              </button>
            </div>
          </motion.div>
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Career Progress</h3>
                <p className="text-blue-100 mb-4">
                  You're making great progress! Keep analyzing and improving your resume.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-sm text-blue-100">Profile Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">A</div>
                    <div className="text-sm text-blue-100">Latest ATS Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-blue-100">Job Matches</div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Briefcase,
  Target,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Analytics = ({ analyticsData, className = '' }) => {
  if (!analyticsData) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { profile, resume, applications, skills, progress } = analyticsData;

  // Summary cards data
  const summaryCards = [
    {
      title: 'Profile Strength',
      value: `${profile.profileStrength || 0}%`,
      change: '+5%',
      changeType: 'positive',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'ATS Score',
      value: resume.latestScore ? `${resume.latestScore}/100` : 'N/A',
      change: resume.scoreImprovement ? `${resume.scoreImprovement > 0 ? '+' : ''}${resume.scoreImprovement}` : '0',
      changeType: resume.scoreImprovement > 0 ? 'positive' : resume.scoreImprovement < 0 ? 'negative' : 'neutral',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Applications',
      value: applications.totalApplications.toString(),
      change: `${applications.responseRate}% response`,
      changeType: applications.responseRate > 50 ? 'positive' : applications.responseRate > 25 ? 'neutral' : 'negative',
      icon: Briefcase,
      color: 'purple'
    },
    {
      title: 'Skills Identified',
      value: skills.totalSkills.toString(),
      change: `${skills.technicalSkills} technical`,
      changeType: 'neutral',
      icon: Award,
      color: 'orange'
    }
  ];

  const getCardColor = (color, type = 'bg') => {
    const colors = {
      blue: type === 'bg' ? 'bg-blue-100' : type === 'text' ? 'text-blue-600' : 'text-blue-500',
      green: type === 'bg' ? 'bg-green-100' : type === 'text' ? 'text-green-600' : 'text-green-500',
      purple: type === 'bg' ? 'bg-purple-100' : type === 'text' ? 'text-purple-600' : 'text-purple-500',
      orange: type === 'bg' ? 'bg-orange-100' : type === 'text' ? 'text-orange-600' : 'text-orange-500'
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Chart colors
  const chartColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // Prepare chart data
  const applicationTrendData = applications.monthlyTrend || [];
  const skillDistributionData = Object.entries(skills.skillDistribution || {}).map(([category, count]) => ({
    name: category,
    value: count
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className={`text-sm mt-1 ${getChangeColor(card.changeType)}`}>
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${getCardColor(card.color)} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${getCardColor(card.color, 'icon')}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Application Activity
          </h3>
          
          {applicationTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={applicationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  name="Applications"
                />
                <Area 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  name="Interviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No application data yet</p>
                <p className="text-sm">Start applying to jobs to see trends</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Skill Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-500" />
            Skills Distribution
          </h3>
          
          {skillDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={skillDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {skillDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No skills data yet</p>
                <p className="text-sm">Upload a resume to see skill analysis</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Application Status Overview */}
      {applications.statusDistribution && Object.keys(applications.statusDistribution).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-green-500" />
            Application Status Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(applications.statusDistribution).map(([status, count], index) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Milestones */}
      {progress.milestones && progress.milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
            Recent Milestones
          </h3>
          
          <div className="space-y-4">
            {progress.milestones.slice(0, 5).map((milestone, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(milestone.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
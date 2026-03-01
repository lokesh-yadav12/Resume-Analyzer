import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Get detailed ATS compatibility scores and improve your resume\'s chances of passing automated screening.',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Skill Analysis',
      description: 'AI-powered skill extraction and gap analysis to identify areas for professional development.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Job Matching',
      description: 'Personalized job recommendations based on your skills, experience, and career goals.',
      color: 'purple'
    },
    {
      icon: Award,
      title: 'Career Insights',
      description: 'Comprehensive analytics and insights to track your career progress and opportunities.',
      color: 'orange'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Resumes Analyzed' },
    { number: '95%', label: 'ATS Pass Rate' },
    { number: '10K+', label: 'Job Matches' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Boost Your Career with
                <span className="text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> AI-Powered</span> Resume Analysis
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-blue-100 max-w-2xl mx-auto lg:mx-0">
                Get instant ATS compatibility scores, personalized job recommendations, 
                and skill gap analysis to accelerate your career growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/resume-analyzer"
                  className="group bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Analyze My Resume
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/signup"
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                >
                  Get Started Free
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start mt-8 space-x-6 text-blue-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Free forever plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">No credit card required</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Floating Cards Demo */}
              <div className="relative">
                {/* Main ATS Score Card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="glass rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">ATS Score</h3>
                    <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Grade A
                    </span>
                  </div>
                  
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
                      <motion.circle 
                        cx="50" cy="50" r="45" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray="283" 
                        strokeDashoffset="70" 
                        strokeLinecap="round" 
                        className="text-green-400"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 70 }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span 
                        className="text-3xl font-bold"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 2 }}
                      >
                        85
                      </motion.span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Keywords</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-green-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '95%' }}
                            transition={{ duration: 1.5, delay: 2.5 }}
                          />
                        </div>
                        <span className="font-semibold text-sm">38/40</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Structure</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '90%' }}
                            transition={{ duration: 1.5, delay: 3 }}
                          />
                        </div>
                        <span className="font-semibold text-sm">18/20</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Contact Info</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-green-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5, delay: 3.5 }}
                          />
                        </div>
                        <span className="font-semibold text-sm">15/15</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Job Match Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 4 }}
                  className="absolute -top-4 -right-4 glass rounded-xl p-4 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold">Job Match</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">92%</div>
                  <div className="text-xs text-blue-200">Senior Developer</div>
                </motion.div>

                {/* Floating Skills Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 4.5 }}
                  className="absolute -bottom-4 -left-4 glass rounded-xl p-4 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold">Skills Found</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">24</div>
                  <div className="text-xs text-blue-200">Technical Skills</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive career tools to help you 
              optimize your resume, discover opportunities, and accelerate your growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const colorClasses = {
                blue: { bg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
                green: { bg: 'bg-green-100', icon: 'text-green-600', gradient: 'from-green-500 to-green-600' },
                purple: { bg: 'bg-purple-100', icon: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
                orange: { bg: 'bg-orange-100', icon: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' }
              };
              const colors = colorClasses[feature.color];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group card card-hover p-6 relative overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${feature.color}-200 rounded-xl transition-colors duration-300`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Career Boost AI Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                description: 'Upload your resume in PDF, DOCX, or TXT format. Our AI will extract and analyze the content.',
                icon: FileText
              },
              {
                step: '2',
                title: 'Get AI Analysis',
                description: 'Receive detailed ATS scores, skill analysis, and personalized improvement recommendations.',
                icon: Target
              },
              {
                step: '3',
                title: 'Find Perfect Jobs',
                description: 'Discover job opportunities that match your skills and get guidance on skill development.',
                icon: TrendingUp
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.2 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Boost Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals who have improved their job search success with Career Boost AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resume-analyzer"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors"
              >
                Create Account
              </Link>
            </div>
            
            <div className="flex items-center justify-center mt-6 text-blue-100">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>No credit card required • Free forever plan available</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
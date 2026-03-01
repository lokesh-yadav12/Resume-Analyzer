import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Users, 
  Award, 
  TrendingUp, 
  Filter,
  Search,
  ChevronDown,
  Star,
  Clock,
  Target
} from 'lucide-react';

const SkillExtractor = ({ skills, className = '' }) => {
  const [activeTab, setActiveTab] = useState('technical');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');

  if (!skills) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { technical = [], soft = [], certifications = [] } = skills;

  // Get unique categories for filtering
  const categories = ['all', ...new Set(technical.map(skill => skill.category))];

  // Filter and sort technical skills
  const filteredTechnicalSkills = technical
    .filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Filter soft skills
  const filteredSoftSkills = soft.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Beginner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceStars = (confidence) => {
    const stars = Math.round(confidence * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const tabs = [
    { id: 'technical', label: 'Technical Skills', icon: Code, count: technical.length },
    { id: 'soft', label: 'Soft Skills', icon: Users, count: soft.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: certifications.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Skills Analysis
        </h3>
        <div className="text-sm text-gray-500">
          {technical.length + soft.length + certifications.length} skills found
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters for Technical Skills */}
      {activeTab === 'technical' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="confidence">Sort by Confidence</option>
              <option value="experience">Sort by Experience</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'technical' && (
          <motion.div
            key="technical"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredTechnicalSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No technical skills found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTechnicalSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProficiencyColor(skill.proficiency)}`}>
                            {skill.proficiency}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {skill.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{skill.yearsExperience} years</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {getConfidenceStars(skill.confidence)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'soft' && (
          <motion.div
            key="soft"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredSoftSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No soft skills found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSoftSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                      <div className="flex items-center space-x-1">
                        {getConfidenceStars(skill.confidence)}
                      </div>
                    </div>
                    
                    {skill.evidence && skill.evidence.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Evidence:</p>
                        {skill.evidence.slice(0, 2).map((evidence, evidenceIndex) => (
                          <div key={evidenceIndex} className="bg-gray-50 rounded p-2 text-sm text-gray-600">
                            "{evidence}"
                          </div>
                        ))}
                        {skill.evidence.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{skill.evidence.length - 2} more examples
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'certifications' && (
          <motion.div
            key="certifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {certifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No certifications found in your resume.</p>
                <p className="text-sm mt-2">Consider adding relevant certifications to boost your profile.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                        {cert.issuer && (
                          <p className="text-sm text-gray-600 mb-2">Issued by {cert.issuer}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {cert.dateObtained && (
                            <span>Obtained: {new Date(cert.dateObtained).toLocaleDateString()}</span>
                          )}
                          {cert.expirationDate && (
                            <span>Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SkillExtractor;
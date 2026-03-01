import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Clock,
  Building2,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const JobFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isLoading = false,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
    onClearFilters?.();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  const workModeOptions = [
    { value: '', label: 'Any' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Onsite', label: 'Onsite' }
  ];

  const experienceLevelOptions = [
    { value: '', label: 'Any Level' },
    { value: 'Entry', label: 'Entry Level' },
    { value: 'Mid', label: 'Mid Level' },
    { value: 'Senior', label: 'Senior Level' },
    { value: 'Executive', label: 'Executive' }
  ];

  const employmentTypeOptions = [
    { value: '', label: 'Any Type' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Internship', label: 'Internship' }
  ];

  const companySizeOptions = [
    { value: '', label: 'Any Size' },
    { value: 'Startup', label: 'Startup (1-10)' },
    { value: 'Small', label: 'Small (11-50)' },
    { value: 'Medium', label: 'Medium (51-200)' },
    { value: 'Large', label: 'Large (201-1000)' },
    { value: 'Enterprise', label: 'Enterprise (1000+)' }
  ];

  const postedWithinOptions = [
    { value: '', label: 'Any Time' },
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last week' },
    { value: '30', label: 'Last month' },
    { value: '90', label: 'Last 3 months' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <Input
          placeholder="Search jobs, companies, or keywords..."
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Location */}
        <Input
          placeholder="Location (city, state, or remote)"
          value={localFilters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          icon={<MapPin className="w-4 h-4" />}
        />

        {/* Work Mode */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {workModeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange('workMode', option.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                localFilters.workMode === option.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={localFilters.experienceLevel || ''}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {experienceLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={localFilters.employmentType || ''}
                  onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {employmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Salary Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min salary"
                    value={localFilters.salaryMin || ''}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max salary"
                    value={localFilters.salaryMax || ''}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Company Size
                </label>
                <select
                  value={localFilters.companySize || ''}
                  onChange={(e) => handleFilterChange('companySize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {companySizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posted Within */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Posted Within
                </label>
                <select
                  value={localFilters.postedWithin || ''}
                  onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {postedWithinOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={localFilters.sortBy || 'postedDate'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="postedDate">Most Recent</option>
                  <option value="relevance">Most Relevant</option>
                  <option value="salaryRange.max">Highest Salary</option>
                  <option value="company.name">Company Name</option>
                  <option value="title">Job Title</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value || value === '') return null;
              
              const getFilterLabel = (key, value) => {
                switch (key) {
                  case 'search': return `Search: "${value}"`;
                  case 'location': return `Location: ${value}`;
                  case 'workMode': return `Work Mode: ${value}`;
                  case 'experienceLevel': return `Experience: ${value}`;
                  case 'employmentType': return `Type: ${value}`;
                  case 'salaryMin': return `Min Salary: $${value}`;
                  case 'salaryMax': return `Max Salary: $${value}`;
                  case 'companySize': return `Company: ${value}`;
                  case 'postedWithin': return `Posted: Last ${value} days`;
                  default: return `${key}: ${value}`;
                }
              };

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Target,
  TrendingUp,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import Button from '../common/Button';

const JobMatchList = ({ 
  matches = [], 
  isLoading = false, 
  error = null,
  onRefresh,
  onSaveJob,
  onApplyJob,
  onViewJobDetails,
  showFilters = true,
  className = '' 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('match_score'); // 'match_score', 'posted_date', 'salary'
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Filter and sort matches
  const filteredMatches = matches.filter(match => {
    if (filters.minMatchScore && match.final_score < filters.minMatchScore) return false;
    if (filters.workMode && match.work_mode !== filters.workMode) return false;
    if (filters.location && !match.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return (b.final_score || 0) - (a.final_score || 0);
      case 'posted_date':
        return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
      case 'salary':
        // Extract salary numbers for comparison (simplified)
        const getSalaryValue = (salaryStr) => {
          if (!salaryStr) return 0;
          const match = salaryStr.match(/(\d+)K/);
          return match ? parseInt(match[1]) * 1000 : 0;
        };
        return getSalaryValue(b.salary_range) - getSalaryValue(a.salary_range);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMatches = sortedMatches.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAverageMatchScore = () => {
    if (matches.length === 0) return 0;
    const total = matches.reduce((sum, match) => sum + (match.final_score || 0), 0);
    return Math.round(total / matches.length);
  };

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Job Matches
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button
          variant="primary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onRefresh}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-500" />
              Job Recommendations
            </h2>
            <p className="text-gray-600 mt-1">
              {isLoading ? (
                'Finding your perfect matches...'
              ) : (
                `${matches.length} jobs found • Average match: ${getAverageMatchScore()}%`
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="match_score">Best Match</option>
              <option value="posted_date">Most Recent</option>
              <option value="salary">Highest Salary</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={onRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Match Score Distribution */}
        {matches.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Match Score Distribution</span>
              <span>{matches.length} total jobs</span>
            </div>
            <div className="flex space-x-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              {[
                { range: '80-100%', color: 'bg-green-500', count: matches.filter(m => m.final_score >= 80).length },
                { range: '60-79%', color: 'bg-blue-500', count: matches.filter(m => m.final_score >= 60 && m.final_score < 80).length },
                { range: '40-59%', color: 'bg-yellow-500', count: matches.filter(m => m.final_score >= 40 && m.final_score < 60).length },
                { range: '0-39%', color: 'bg-red-500', count: matches.filter(m => m.final_score < 40).length }
              ].map((segment, index) => (
                <div
                  key={index}
                  className={`${segment.color} transition-all duration-500`}
                  style={{ width: `${(segment.count / matches.length) * 100}%` }}
                  title={`${segment.range}: ${segment.count} jobs`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <JobFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          isLoading={isLoading}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analyzing Your Profile
          </h3>
          <p className="text-gray-600">
            Our AI is finding the best job matches for your skills and experience...
          </p>
        </div>
      )}

      {/* Job Matches */}
      {!isLoading && (
        <AnimatePresence mode="wait">
          {paginatedMatches.length === 0 ? (
            <motion.div
              key="no-matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Job Matches Found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or upload a more detailed resume to get better matches.
              </p>
              <Button
                variant="primary"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Job Cards Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                  : 'space-y-4'
              }>
                {paginatedMatches.map((match, index) => (
                  <motion.div
                    key={match.job_id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <JobCard
                      job={{
                        id: match.job_id,
                        title: match.title,
                        company: match.company,
                        location: match.location,
                        work_mode: match.work_mode,
                        salary_range: match.salary_range,
                        external_url: match.external_url,
                        daysSincePosted: match.daysSincePosted,
                        urgency: match.urgency
                      }}
                      matchScore={match}
                      onSave={onSaveJob}
                      onApply={onApplyJob}
                      onViewDetails={onViewJobDetails}
                      showMatchScore={true}
                      className={viewMode === 'list' ? 'w-full' : ''}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ChevronLeft className="w-4 h-4" />}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Results Summary */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedMatches.length)} of {sortedMatches.length} matches
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default JobMatchList;
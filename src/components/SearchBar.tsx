import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<SearchFilters['filterType']>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch({ query, filterType, availableOnly });
  };

  const handleClear = () => {
    setQuery('');
    setFilterType('all');
    setAvailableOnly(false);
    onSearch({ query: '', filterType: 'all', availableOnly: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for books, authors, ISBN, or subjects..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center space-x-2 ${
                showAdvanced 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search in
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as SearchFilters['filterType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title Only</option>
                  <option value="author">Author Only</option>
                  <option value="isbn">ISBN Only</option>
                  <option value="subject">Subject Only</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700 font-medium">Show only available books</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
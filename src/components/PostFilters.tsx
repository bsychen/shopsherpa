"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, X, Tag, TrendingUp, Clock, Heart } from 'lucide-react';

interface PostFiltersProps {
  selectedTags: string[];
  sortBy: 'recent' | 'popular' | 'trending';
  searchTerm: string;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: 'recent' | 'popular' | 'trending') => void;
  onSearchChange: (search: string) => void;
}

interface TagOption {
  id: string;
  name: string;
  category: string;
  usageCount: number;
}

export default function PostFilters({
  selectedTags,
  sortBy,
  searchTerm,
  onTagsChange,
  onSortChange,
  onSearchChange,
}: PostFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  const clearAllFilters = () => {
    onTagsChange([]);
    onSearchChange('');
    onSortChange('recent');
  };

  const hasActiveFilters = selectedTags.length > 0 || searchTerm.length > 0 || sortBy !== 'recent';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search posts..."
        />
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSortChange('recent')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'recent'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock size={14} />
              Recent
            </button>
            <button
              onClick={() => onSortChange('popular')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={14} />
              Popular
            </button>
            <button
              onClick={() => onSortChange('trending')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === 'trending'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp size={14} />
              Trending
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              showFilters || selectedTags.length > 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <Tag size={12} />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-blue-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          {/* Tag Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search tags..."
            />
          </div>

          {/* Available Tags */}
          {filteredTags.length > 0 ? (
            <div className="space-y-3">
              {['food-type', 'country', 'diet', 'other'].map((category) => {
                const categoryTags = filteredTags.filter(tag => tag.category === category);
                if (categoryTags.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => addTag(tag.name)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Tag size={12} />
                          {tag.name}
                          <span className="text-xs text-gray-500">({tag.usageCount})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Tag size={48} className="mx-auto mb-2 opacity-50" />
              <p>No tags found</p>
              {tagSearch && (
                <p className="text-sm">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, X, Tag, TrendingUp, Clock, Heart } from 'lucide-react';
import { Tag as TagType } from '@/types/post';
import { colours } from '@/styles/colours';

interface PostFiltersProps {
  selectedTags: string[];
  sortBy: 'recent' | 'popular' | 'trending';
  searchTerm: string;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: 'recent' | 'popular' | 'trending') => void;
  onSearchChange: (search: string) => void;
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
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
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
    <div className="rounded-lg shadow-sm p-4 mb-6" style={{ backgroundColor: colours.card.background, border: `1px solid ${colours.card.border}` }}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colours.text.muted }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg"
          style={{
            border: `1px solid ${colours.card.border}`,
            backgroundColor: colours.input.background,
            color: colours.input.text
          }}
          placeholder="Search posts..."
        />
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: colours.text.primary }}>Sort by:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSortChange('recent')}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors"
              style={{
                backgroundColor: sortBy === 'recent' ? colours.tag.primary.background : colours.tag.default.background,
                color: sortBy === 'recent' ? colours.tag.primary.text : colours.tag.default.text
              }}
            >
              <Clock size={14} />
              Recent
            </button>
            <button
              onClick={() => onSortChange('popular')}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors"
              style={{
                backgroundColor: sortBy === 'popular' ? colours.tag.primary.background : colours.tag.default.background,
                color: sortBy === 'popular' ? colours.tag.primary.text : colours.tag.default.text
              }}
            >
              <Heart size={14} />
              Popular
            </button>
            <button
              onClick={() => onSortChange('trending')}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors"
              style={{
                backgroundColor: sortBy === 'trending' ? colours.tag.primary.background : colours.tag.default.background,
                color: sortBy === 'trending' ? colours.tag.primary.text : colours.tag.default.text
              }}
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
              className="text-sm font-medium hover:underline"
              style={{ color: colours.status.error.text }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: showFilters || selectedTags.length > 0 ? colours.tag.primary.background : colours.tag.default.background,
              color: showFilters || selectedTags.length > 0 ? colours.tag.primary.text : colours.tag.default.text
            }}
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
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: colours.tag.primary.background,
                color: colours.tag.primary.text
              }}
            >
              <Tag size={12} />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:opacity-70"
                style={{ color: colours.tag.primary.text }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="pt-4" style={{ borderTop: `1px solid ${colours.card.border}` }}>
          {/* Tag Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: colours.text.muted }} />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              style={{
                border: `1px solid ${colours.card.border}`,
                backgroundColor: colours.input.background,
                color: colours.input.text
              }}
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
                    <h4 className="text-sm font-medium mb-2 capitalize" style={{ color: colours.text.primary }}>
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => addTag(tag.name)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: colours.tag.default.background,
                            color: colours.tag.default.text,
                            border: `1px solid ${colours.tag.default.border}`
                          }}
                        >
                          <Tag size={12} />
                          {tag.name}
                          <span className="text-xs" style={{ color: colours.text.muted }}>({tag.usageCount})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: colours.text.muted }}>
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

"use client";

import { useState, useEffect } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { Tag as TagType } from '@/types/post';
import { colours } from '@/styles/colours';
import TagSortButtonGroup from './TagSortButtonGroup';
import FilterToggleButton from './FilterToggleButton';

interface PostFiltersProps {
  selectedTags: string[];
  sortBy: 'recent' | 'popular';
  searchTerm: string;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: 'recent' | 'popular') => void;
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
    <div>
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colours.text.muted }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg shadow-xl border-2 border-black focus:outline-none shadow-md transition-all duration-200 focus:scale-[1.02] text-base"
          style={{
            backgroundColor: colours.input.background,
            border: `2px solid ${colours.input.border}`,
            color: colours.input.text
          }}
          placeholder="Search posts..."
          onFocus={(e) => {
            e.target.style.borderColor = colours.input.focus.border;
            e.target.style.boxShadow = colours.input.focus.ring;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colours.input.border;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      {/* Sort and Filter Controls - Same Width as Search Bar */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <TagSortButtonGroup 
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
        
        <FilterToggleButton
          isActive={showFilters}
          selectedCount={selectedTags.length}
          onClick={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
              style={{
                backgroundColor: colours.tag.primary.background,
                color: colours.tag.primary.text
              }}
            >
              <Tag size={10} />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:opacity-70"
                style={{ color: colours.tag.primary.text }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="pt-3 sm:pt-4" style={{ borderTop: `1px solid ${colours.card.border}` }}>
          {/* Tag Search */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: colours.text.muted }} />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 rounded-lg text-sm"
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
                    <h4 className="text-xs sm:text-sm font-medium mb-2 capitalize" style={{ color: colours.text.primary }}>
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {categoryTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => addTag(tag.name)}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: colours.tag.default.background,
                            color: colours.tag.default.text,
                            border: `1px solid ${colours.tag.default.border}`
                          }}
                        >
                          <Tag size={10} />
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
            <div className="text-center py-6 sm:py-8" style={{ color: colours.text.muted }}>
              <Tag size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tags found</p>
              {tagSearch && (
                <p className="text-xs">Try a different search term</p>
              )}
            </div>
          )}

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${colours.card.border}` }}>
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: colours.status.error.background,
                  color: colours.status.error.border,
                  border: `2px solid ${colours.status.error.border}`
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

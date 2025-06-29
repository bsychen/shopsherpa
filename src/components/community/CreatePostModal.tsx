"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Tag, Package } from 'lucide-react';
import { Product } from '@/types/product';
import ContentBox from '@/components/community/ContentBox';
import { colours } from '@/styles/colours';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: {
    title: string;
    content: string;
    tags: string[];
    linkedProductId?: string;
  }) => void;
  isLoading?: boolean;
}

const PREDEFINED_TAGS = {
  'food-type': ['Organic', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Raw', 'Sugar-Free'],
  'country': ['UK', 'Italy', 'France', 'Spain', 'Germany', 'USA', 'Japan', 'India', 'Mexico', 'Greece'],
  'diet': ['Vegetarian', 'Pescatarian', 'Mediterranean', 'Low-Carb', 'High-Protein', 'Whole30'],
  'other': ['Budget-Friendly', 'Premium', 'Local', 'Imported', 'Seasonal', 'Artisan', 'Mass-Market']
};

export default function CreatePostModal({ isOpen, onClose, onSubmit, isLoading }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts(searchTerm);
    } else {
      setProducts([]);
    }
  }, [searchTerm]);

  const searchProducts = async (term: string) => {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      linkedProductId: selectedProduct?.id,
    });

    // Reset form
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setSelectedProduct(null);
    setSearchTerm('');
    setProducts([]);
    setShowProductSearch(false);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center z-[9999] p-4 pt-4" 
      style={{ backgroundColor: 'transparent' }}
    >
      <ContentBox className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colours.text.primary }}>Create New Post</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <X size={20} style={{ color: colours.text.secondary }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colours.text.primary }}
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colours.input.background,
                  borderColor: colours.input.border,
                  color: colours.input.text
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colours.input.focus.border;
                  e.currentTarget.style.boxShadow = colours.input.focus.ring;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colours.input.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="What's your post about?"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colours.text.primary }}
              >
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 h-32 resize-none"
                style={{
                  backgroundColor: colours.input.background,
                  borderColor: colours.input.border,
                  color: colours.input.text
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colours.input.focus.border;
                  e.currentTarget.style.boxShadow = colours.input.focus.ring;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colours.input.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Share your thoughts, experiences, or questions..."
                maxLength={1000}
                required
              />
            </div>

            {/* Linked Product */}
            <div>
              <div className="flex items-center justify-end mb-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTags(!showTags)}
                    className={`flex items-center gap-2 px-3 py-2 shadow-xl rounded-xl text-xs font-medium transition-all ${
                      showTags ? 'shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: showTags 
                        ? colours.button.primary.background 
                        : colours.tag.default.background,
                      color: showTags 
                        ? colours.button.primary.text 
                        : colours.text.secondary,
                      border: `2px solid ${colours.button.primary.text}`
                    }}
                  >
                    <Tag size={14} />
                    {showTags ? 'Hide Tags' : 'Tags'}
                  </button>
                  {!selectedProduct && (
                    <button
                      type="button"
                      onClick={() => setShowProductSearch(!showProductSearch)}
                      className={`flex items-center gap-2 px-3 py-2 shadow-xl rounded-xl text-xs font-medium transition-all ${
                        showProductSearch ? 'shadow-sm' : ''
                      }`}
                      style={{
                        backgroundColor: showProductSearch 
                          ? colours.button.primary.background 
                          : colours.tag.default.background,
                        color: showProductSearch 
                          ? colours.button.primary.text 
                          : colours.text.secondary,
                        border: `2px solid ${colours.button.primary.text}`
                      }}
                    >
                      <Package size={14} />
                      {showProductSearch ? 'Hide Product Search' : 'Link Product'}
                    </button>
                  )}
                </div>
              </div>
              
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 rounded-lg shadow-sm border-2 mb-3" style={{ 
                  backgroundColor: colours.tag.primary.background, 
                  borderColor: colours.button.primary.background
                }}>
                  <div className="flex-shrink-0">
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.productName}
                      width={32}
                      height={32}
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: colours.tag.primary.text }}>
                      {selectedProduct.productName}
                    </p>
                    <p className="text-xs opacity-80" style={{ color: colours.tag.primary.text }}>
                      {selectedProduct.brandName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductSearch(false);
                      setSearchTerm('');
                      setProducts([]);
                    }}
                    className="flex-shrink-0 p-1 rounded-full hover:opacity-70 transition-opacity"
                    style={{ color: colours.tag.primary.text }}
                    title="Remove linked product"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {showProductSearch && !selectedProduct && (
                <div className="relative mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: colours.text.muted }} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: colours.button.primary.background,
                        backgroundColor: colours.input.background,
                        color: colours.input.text,
                        boxShadow: `0 0 0 2px ${colours.button.primary.background}20`
                      }}
                      placeholder="Search for a product to link..."
                      autoFocus
                    />
                  </div>
                  {products.length > 0 && (
                    <div className="absolute top-full left-0 right-0 rounded-lg mt-2 max-h-40 overflow-y-auto z-10 shadow-xl border-2" style={{ 
                      backgroundColor: colours.card.background, 
                      borderColor: colours.button.primary.background
                    }}>
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSearchTerm('');
                            setProducts([]);
                            setShowProductSearch(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:opacity-80 text-left transition-all border-b last:border-b-0"
                          style={{ 
                            backgroundColor: colours.card.background,
                            borderBottomColor: colours.card.border
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colours.card.hover.background;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colours.card.background;
                          }}
                        >
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            width={28}
                            height={28}
                            className="object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: colours.text.primary }}>
                              {product.productName}
                            </p>
                            <p className="text-xs truncate" style={{ color: colours.text.secondary }}>
                              {product.brandName}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {/* Always show selected tags */}
            {selectedTags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
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
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1"
                        style={{ color: colours.tag.primary.text }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colours.tag.primary.hover.text;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colours.tag.primary.text;
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Show tag adding interface only when showTags is true */}
            {showTags && (
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colours.text.primary }}
                >
                  Tags (Max 5)
                </label>

                {/* Add Custom Tag */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colours.input.background,
                      borderColor: colours.input.border,
                      color: colours.input.text
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colours.input.focus.border;
                      e.currentTarget.style.boxShadow = colours.input.focus.ring;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colours.input.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Add custom tag..."
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: colours.button.secondary.background,
                      color: colours.button.secondary.text
                    }}
                    onMouseEnter={(e) => {
                      if (!customTag.trim() || selectedTags.length >= 5) return;
                      e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colours.button.secondary.background;
                    }}
                    disabled={!customTag.trim() || selectedTags.length >= 5}
                  >
                    Add
                  </button>
                </div>

                {/* Predefined Tags */}
                <div className="space-y-3">
                  {Object.entries(PREDEFINED_TAGS).map(([category, tags]) => (
                    <div key={category}>
                      <h4 
                        className="text-sm font-medium mb-2 capitalize"
                        style={{ color: colours.text.primary }}
                      >
                        {category.replace('-', ' ')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="px-3 py-1 rounded-full text-sm border transition-colors"
                            style={{
                              backgroundColor: selectedTags.includes(tag) 
                                ? colours.tag.primary.background 
                                : colours.tag.default.background,
                              color: selectedTags.includes(tag)
                                ? colours.tag.primary.text
                                : colours.tag.default.text,
                              borderColor: selectedTags.includes(tag)
                                ? colours.tag.primary.border
                                : colours.tag.default.border
                            }}
                            onMouseEnter={(e) => {
                              if (!selectedTags.includes(tag) && selectedTags.length < 5) {
                                e.currentTarget.style.backgroundColor = colours.tag.default.hover.background;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedTags.includes(tag)) {
                                e.currentTarget.style.backgroundColor = colours.tag.default.background;
                              }
                            }}
                            disabled={selectedTags.includes(tag) || selectedTags.length >= 5}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg"
                style={{
                  backgroundColor: colours.button.ghost.background,
                  border: `2px solid ${colours.button.primary.text}`,
                  color: colours.button.ghost.text
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || isLoading}
                className="flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colours.button.primary.background,
                  color: colours.button.primary.text,
                  border: `2px solid ${colours.button.primary.text}`
                }}
              >
                {isLoading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
      </ContentBox>
    </div>
  );
}

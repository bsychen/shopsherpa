"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Tag, Link } from 'lucide-react';
import { Product } from '@/types/product';
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
      className="fixed inset-0 flex items-center justify-center z-50 p-4" 
      style={{ backgroundColor: `${colours.text.primary}80` }} // 50% opacity
    >
      <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: colours.card.background }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colours.text.primary }}>Create New Post</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: colours.interactive.hover.background }}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: colours.text.primary }}>Link a Product (Optional)</label>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="flex items-center gap-1 hover:underline"
                  style={{ color: colours.text.link }}
                >
                  <Link size={16} />
                  {showProductSearch ? 'Hide' : 'Add Product'}
                </button>
              </div>
              
              {selectedProduct && (
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg mb-3" 
                  style={{ backgroundColor: colours.background.secondary }}
                >
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.productName}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                  <div className="flex-1">
                    <p 
                      className="font-medium text-sm"
                      style={{ color: colours.text.primary }}
                    >
                      {selectedProduct.productName}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: colours.text.secondary }}
                    >
                      {selectedProduct.brandName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    style={{ color: colours.status.error.text }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colours.status.error.border;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colours.status.error.text;
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {showProductSearch && !selectedProduct && (
                <div className="relative">
                  <div className="relative">
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      size={16}
                      style={{ color: colours.text.secondary }}
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
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
                      placeholder="Search for a product..."
                    />
                  </div>
                  {products.length > 0 && (
                    <div 
                      className="absolute top-full left-0 right-0 border rounded-lg mt-1 max-h-48 overflow-y-auto z-10"
                      style={{
                        backgroundColor: colours.content.surface,
                        borderColor: colours.content.border
                      }}
                    >
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSearchTerm('');
                            setProducts([]);
                          }}
                          className="w-full flex items-center gap-3 p-3 text-left"
                          style={{
                            backgroundColor: colours.content.surface
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colours.interactive.hover.background;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colours.content.surface;
                          }}
                        >
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                          <div>
                            <p 
                              className="font-medium text-sm"
                              style={{ color: colours.text.primary }}
                            >
                              {product.productName}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: colours.text.secondary }}
                            >
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
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colours.text.primary }}
              >
                Tags (Max 5)
              </label>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
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
              )}

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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg"
                style={{
                  backgroundColor: colours.button.ghost.background,
                  borderColor: colours.content.border,
                  color: colours.button.ghost.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colours.button.ghost.hover.background;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colours.button.ghost.background;
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
                  color: colours.button.primary.text
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colours.button.primary.hover.background;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colours.button.primary.background;
                  }
                }}
              >
                {isLoading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

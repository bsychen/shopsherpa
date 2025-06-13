"use client";

import { useState, useEffect } from 'react';
import { X, Search, Tag, Link } from 'lucide-react';

interface Product {
  id: string;
  productName: string;
  brandName: string;
  imageUrl: string;
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's your post about?"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Share your thoughts, experiences, or questions..."
                maxLength={1000}
                required
              />
            </div>

            {/* Linked Product */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Link a Product (Optional)</label>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Link size={16} />
                  {showProductSearch ? 'Hide' : 'Add Product'}
                </button>
              </div>
              
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedProduct.productName}</p>
                    <p className="text-gray-600 text-xs">{selectedProduct.brandName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {showProductSearch && !selectedProduct && (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search for a product..."
                    />
                  </div>
                  {products.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSearchTerm('');
                            setProducts([]);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm">{product.productName}</p>
                            <p className="text-gray-600 text-xs">{product.brandName}</p>
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
              <label className="block text-sm font-medium mb-2">Tags (Max 5)</label>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <Tag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-600"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add custom tag..."
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={!customTag.trim() || selectedTags.length >= 5}
                >
                  Add
                </button>
              </div>

              {/* Predefined Tags */}
              <div className="space-y-3">
                {Object.entries(PREDEFINED_TAGS).map(([category, tags]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

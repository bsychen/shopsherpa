"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { searchProducts } from "@/lib/api";
import { colours } from "@/styles/colours";

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductSearch() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const products = await searchProducts(searchQuery.toLowerCase());
      setResults(products);
      setShowAll(false);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const handleManualSearch = () => {
    handleSearch(query);
  };

  return (
    <div 
      className="relative max-w-xl mx-auto mt-10 rounded-xl shadow p-8 flex flex-col items-center min-h-[400px]"
      style={{
        backgroundColor: colours.card.background,
        border: `1px solid ${colours.card.border}`
      }}
    >
      <div className="relative w-full h-10 mb-2">
        <Link
          href="/"
          className="flex items-center hover:underline absolute top-0 left-0 z-20"
          style={{ color: colours.text.link }}
        >
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">Go back home</span>
        </Link>
      </div>
      <h1 
        className="text-2xl font-bold mb-6 mt-2"
        style={{ color: colours.text.primary }}
      >
        Search for a Product
      </h1>
      <div className="w-full flex justify-center mb-6">
        <div className="w-full max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search for a product..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            className="flex-1 min-w-0 px-4 py-2 sm:px-5 sm:py-3 rounded-lg focus:outline-none shadow-md transition-all duration-200 focus:scale-[1.03] text-base sm:text-lg"
            style={{
              backgroundColor: colours.input.background,
              border: `2px solid ${colours.input.border}`,
              color: colours.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colours.input.focus.border;
              e.target.style.boxShadow = colours.input.focus.ring;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colours.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleManualSearch}
            disabled={isLoading}
            className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors font-bold text-base sm:text-lg shadow-md focus:outline-none flex items-center justify-center"
            style={{
              backgroundColor: colours.button.primary.background,
              color: colours.button.primary.text
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.hover.background}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.background}
            onFocus={(e) => e.currentTarget.style.boxShadow = colours.input.focus.ring}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}

            aria-label="Search"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="w-full">
        {(showAll ? results : results.slice(0, 5)).map((product, idx) => {
          const fadeOpacities = [1, 0.7, 0.4, 0.2, 0.1];
          const opacity = !showAll ? (fadeOpacities[idx] ?? 1) : 1;
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block rounded-lg shadow-sm p-4 transition cursor-pointer mb-3"
              style={{ 
                opacity,
                backgroundColor: colours.content.surface,
                border: `1px solid ${colours.content.border}`
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.card.hover.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.content.surface}
            >
              <div 
                className="font-semibold text-lg mb-1"
                style={{ color: colours.text.primary }}
              >
                {product.productName}
              </div>
              <div 
                className="text-xs"
                style={{ color: colours.text.muted }}
              >
                Product ID: {product.id}
              </div>
            </Link>
          );
        })}
        {!showAll && results.length > 5 && (
          <div className="flex justify-center mt-3">
            <button
              className="px-4 py-2 rounded text-sm transition"
              style={{
                backgroundColor: colours.button.secondary.background,
                color: colours.button.secondary.text
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.button.secondary.background}
              onClick={() => setShowAll(true)}
            >
              See more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import Link from "next/link";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { searchProducts } from "@/lib/api";
import { colours } from "@/styles/colours";
import { ProductSearchResult } from "@/types/product";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";

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

// Memoized SearchResult component for better performance
const SearchResult = memo(({ product, onSelect }: { product: ProductSearchResult; onSelect: () => void }) => {
  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onSelect}
      className="block p-3 transition cursor-pointer border-b last:border-b-0"
      style={{ 
        borderColor: colours.content.border
      }}
    >
      <div 
        className="font-medium text-sm mb-1"
        style={{ color: colours.text.primary }}
      >
        {product.productName}
      </div>
      <div 
        className="text-xs"
        style={{ color: colours.text.muted }}
      >
        ID: {product.id}
      </div>
    </Link>
  );
});

SearchResult.displayName = 'SearchResult';

export default function ProductSearch() {
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  
  const debouncedQuery = useDebounce(query, 500); // Increased debounce delay

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const products = await searchProducts(searchQuery.toLowerCase());
      setResults(products);
      setShowAll(false);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  // Barcode scanner setup
  useEffect(() => {
    let active = true;
    let controls: { stop: () => void } | null = null;

    (async () => {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length > 0 && videoRef.current) {
        const codeReader = new BrowserMultiFormatReader();
        controls = await codeReader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current,
          (result, _err, c) => {
            if (result && active) {
              router.push(`/product/${result.getText()}`);
              c.stop();
              active = false;
            }
          }
        );
      }
    })();

    return () => {
      active = false;
      if (controls) controls.stop();
    };
  }, [router]);

  const handleManualSearch = () => {
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setShowDropdown(false);
    }
  };

  const handleProductSelect = () => {
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div 
      className="relative max-w-xl mx-auto shadow p-6 flex flex-col items-center min-h-[600px]"
      style={{
        backgroundColor: colours.background.secondary,
      }}
    >
    <div 
        className="w-full max-w-xl rounded-lg shadow-lg border-2 border-black p-6 flex flex-col border relative  mb-4"
        style={{ 
          backgroundColor: colours.content.surface,
          borderColor: colours.content.border
        }}
      >
        <h1 
          className="text-2xl font-bold mb-4"
          style={{ color: colours.text.primary }}
        >
          Search for a Product
        </h1>
        
        {/* Search Bar */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-md flex gap-2">
            <input
              type="text"
              placeholder="Search for a product..."
              onChange={handleInputChange}
              value={query}
              className="flex-1 min-w-0 px-4 py-2 sm:px-5 sm:py-3 rounded-lg shadow-xl border-2 border-black focus:outline-none shadow-md transition-all duration-200 focus:scale-[1.03] text-base sm:text-lg"
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
              className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-xl border-2 border-black shadow-sm transition-colors font-bold text-base sm:text-lg shadow-md focus:outline-none flex items-center justify-center"
              style={{
                backgroundColor: `${colours.button.primary.background}80`,
                color: colours.button.primary.text
              }}
              onFocus={(e) => e.currentTarget.style.boxShadow = colours.input.focus.ring}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              aria-label="Search"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke='#0C4038'
                  strokeWidth="2.4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </button>
          </div>
        </div>
      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="w-full mb-4">
          <div 
            className="w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: colours.content.surface,
              border: `1px solid ${colours.content.border}`
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm" style={{ color: colours.text.muted }}>
                  Searching...
                </span>
              </div>
            ) : results.length > 0 ? (
              <>
                {(showAll ? results : results.slice(0, 5)).map((product) => (
                  <SearchResult 
                    key={product.id} 
                    product={product} 
                    onSelect={handleProductSelect}
                  />
                ))}
                {!showAll && results.length > 5 && (
                  <div className="p-2 text-center">
                    <button
                      className="text-sm transition"
                      style={{ color: colours.text.link }}
                      onClick={() => setShowAll(true)}
                    >
                      See {results.length - 5} more results
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
      </div>

      <div 
        className="w-full max-w-xl rounded-lg shadow-lg border-2 border-black p-6 flex flex-col items-center border relative  mb-4"
        style={{ 
          backgroundColor: colours.content.surface,
          borderColor: colours.content.border
        }}
      >
        {/* Barcode Scanner */}
        <div className="w-full flex flex-col">
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: colours.text.primary }}
          >
            Scan a Barcode
          </h1>
          <div 
            className="rounded-lg overflow-hidden shadow-xl mb-4 w-full max-w-xs flex items-center justify-center aspect-video"
            style={{ 
              backgroundColor: colours.content.surface,
              border: `2px solid ${colours.card.border}`
            }}
          >
            <video ref={videoRef} className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Recently Viewed Products Section */}
      
      {/* Recently Viewed Products */}
      {firebaseUser && (
        <div className="w-full">
          <div 
            className="w-full max-w-xl rounded-lg shadow-lg border-2 border-black p-6 items-center"
            style={{
              backgroundColor: colours.content.surfaceSecondary,
              border: `2px solid ${colours.content.border}`
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colours.text.secondary }}
            >
              Recently Viewed Products
            </h2>
            <RecentlyViewedProducts userId={firebaseUser.uid} />
          </div>
        </div>
      )}
    </div>
  );
}

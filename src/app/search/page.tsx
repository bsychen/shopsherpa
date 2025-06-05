"use client";

import { useState } from "react";
import Link from "next/link";
import { searchProducts } from "@/lib/api";

export default function ProductSearch() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleSearch = async () => {
    const products = await searchProducts(query.toLowerCase());
    setResults(products);
  };

  return (
    <div className="relative max-w-xl mx-auto mt-10 bg-white rounded-xl shadow p-8 border border-zinc-200 flex flex-col items-center min-h-[400px]">
      <div className="relative w-full h-10 mb-2">
        <Link
          href="/"
          className="flex items-center text-blue-600 hover:underline absolute top-0 left-0 z-20"
        >
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">Go back home</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 mt-2">Search for a Product</h1>
      <div className="w-full flex justify-center mb-6">
        <div className="w-full max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search for a product..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            className="flex-1 min-w-0 px-4 py-2 sm:px-5 sm:py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 bg-white text-zinc-900 text-base sm:text-lg shadow-md transition-all duration-200 focus:scale-[1.03]"
          />
          <button
            onClick={handleSearch}
            className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-base sm:text-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center"
            aria-label="Search"
          >
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
              className="block bg-white rounded-lg border border-zinc-200 shadow-sm p-4 hover:bg-zinc-50 transition cursor-pointer mb-3"
              style={{ opacity }}
            >
              <div className="font-semibold text-zinc-800 text-lg mb-1">
                {product.name}
              </div>
              <div className="text-xs text-gray-400">
                Product ID: {product.id}
              </div>
            </Link>
          );
        })}
        {!showAll && results.length > 5 && (
          <div className="flex justify-center mt-3">
            <button
              className="px-4 py-2 rounded bg-zinc-200 hover:bg-zinc-300 text-sm text-zinc-700 transition"
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

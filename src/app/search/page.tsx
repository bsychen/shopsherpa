"use client";

import { useState } from "react";
import Link from "next/link";
import { searchProducts } from "@/lib/api";

export default function ProductSearch() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    const products = await searchProducts(query.toLowerCase());
    setResults(products);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-xl w-full flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2">Search for a Product</h1>
        <div className="flex w-full gap-2 mb-2">
          <input
            type="text"
            placeholder="Search for a product..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
          >
            Search
          </button>
        </div>
        <div className="w-full">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block p-4 mb-3 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100 no-underline"
            >
              <div className="font-medium text-lg">{product.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

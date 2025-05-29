"use client"

import { useState } from "react"
import Link from "next/link"

const API_BASE = 'http://localhost:3001'; //backend API base URL

export async function searchProducts(query) {
  const res = await fetch(`${API_BASE}/api/products/search?name=${encodeURIComponent(query)}`);
  return await res.json();
}

export default function ProductSearch() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    const products = await searchProducts(query);
    setResults(products);
  };

  console.log("Results:", results);

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search for products..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button onClick={handleSearch}>Search</button>

        <div>
          {results.map((product) => (
            <Link 
              key={product.id} 
              href={`/product/${product.id}`}
              style={{ 
                display: "block", 
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                textDecoration: "none",
                color: "black"
              }}
            >
              <div>{product.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

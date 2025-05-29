"use client"

import { useState } from "react"
import Link from "next/link"

const MOCK_PRODUCTS = [
  { id: 1, name: "Organic Bananas" },
  { id: 2, name: "Whole Milk" },
  { id: 3, name: "Brown Bread" }
]

export default function Home() {
  const [search, setSearch] = useState("")
  
  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          {filteredProducts.map((product) => (
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
  )
}
// test preview

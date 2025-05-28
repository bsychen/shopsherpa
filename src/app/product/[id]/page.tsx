"use client"

import Link from "next/link"

const MOCK_PRODUCTS = [
  { id: 1, name: "Organic Bananas", dbPrice: 1.15 },
  { id: 2, name: "Whole Milk", dbPrice: 1.40 },
  { id: 3, name: "Brown Bread", dbPrice: 1.05 }
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = MOCK_PRODUCTS.find(p => p.id === parseInt(params.id))

  if (!product) {
    return (
      <div style={{ padding: "20px" }}>
        <div>Product not found</div>
        <Link href="/" style={{ color: "blue" }}>Back to search</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: "20px" }}>
      <Link href="/" style={{ color: "blue", display: "block", marginBottom: "20px" }}>
        Back to search
      </Link>
      
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>{product.name}</h1>
      <div>What you should be paying: £{product.dbPrice.toFixed(2)}</div>
    </div>
  )
}

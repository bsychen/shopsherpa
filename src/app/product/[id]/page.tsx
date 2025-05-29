"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Product } from "@/types/product"
import { getProduct } from "@/lib/api"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    getProduct(id).then((data) => {
      setProduct(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <div>Loading...</div>
      </div>
    );
  }

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

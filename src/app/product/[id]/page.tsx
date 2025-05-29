"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export async function getProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProduct(params.id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [params.id]);

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

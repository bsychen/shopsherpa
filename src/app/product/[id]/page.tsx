"use client"

import { useState, useEffect, use } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/reviews"
import { getProduct, getProductReviews } from "@/lib/api"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    getProduct(id).then((data) => {
      setProduct(data)
      setLoading(false)
    })
    getProductReviews(id).then((data) => setReviews(data || []));
  }, [id])



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
        <div className="text-lg text-zinc-700">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
        <div className="text-lg text-red-600 mb-4">Product not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-6 flex flex-col items-center border border-zinc-200">
        <h1 className="text-2xl font-bold mb-4 text-center text-zinc-800">{product.name}</h1>
        <div className="text-lg text-zinc-700 mb-2">What you should be paying:</div>
        <div className="text-3xl font-semibold text-green-600 mb-2">£{product.dbPrice.toFixed(2)}</div>
        {/* Reviews Section */}
        <div className="w-full mt-6">
          <h2 className="text-xl font-semibold mb-2 text-zinc-800">Reviews</h2>
          {reviews.length === 0 ? (
            <div className="text-zinc-500">No reviews yet.</div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-zinc-200 pb-2">
                  <div className="font-bold text-zinc-700">User: {review.userId}</div>
                  <div className="text-zinc-700">{review.reviewText || (review as any)["Review-Text"] || "(No review text)"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

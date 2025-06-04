import { useEffect, useState } from "react";
import { getUserReviews, getProduct } from "@/lib/api";
import { Review } from "@/types/review";
import Link from "next/link";

interface UserReviewsListProps {
  userId: string;
}

export default function UserReviewsList({ userId }: UserReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      const data = await getUserReviews(userId);
      setReviews(data || []);
      setLoading(false);
    }
    if (userId) fetchReviews();
  }, [userId]);

  useEffect(() => {
    async function fetchProductNames() {
      const ids = Array.from(new Set(reviews.map(r => r.productId)));
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async (id) => {
        const product = await getProduct(id);
        if (product && product.name) names[id] = product.name;
      }));
      setProductNames(names);
    }
    if (reviews.length) fetchProductNames();
  }, [reviews]);

  if (loading) return <div className="text-gray-400">Loading reviews...</div>;
  if (!reviews.length) return <div className="text-gray-400">No reviews yet.</div>;

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="bg-zinc-50 rounded p-3 border border-zinc-200">
          <div className="flex items-center justify-between">
            <Link href={`/product/${review.productId}`} className="font-semibold text-blue-600 hover:underline">
              {productNames[review.productId] || "View Product"}
            </Link>
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-1 text-sm text-gray-700">{review.reviewText}</div>
          <div className="mt-2 flex gap-4 text-sm">
            <span title="Value Rating">💰 {review.valueRating}</span>
            <span title="Quality Rating">🍎 {review.qualityRating}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

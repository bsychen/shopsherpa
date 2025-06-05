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
  const [showAll, setShowAll] = useState(false);

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

  // Remove loading spinner and always render the list, but apply blur/opacity when loading
  if (!reviews.length && !loading) return <div className="text-gray-400">No reviews yet.</div>;

  // Sort reviews by createdAt descending
  const sortedReviews = [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);
  const fadeOpacities = [1, 0.7, 0.4];

  return (
    <div className={`transition-all duration-300 ${loading ? 'opacity-40 blur-[2px] pointer-events-none select-none' : 'opacity-100 blur-0'}`}>
      <ul className="space-y-3">
        {visibleReviews.map((review, idx) => (
          <li
            key={review.id}
            className="bg-zinc-50 rounded p-3 border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
            style={!showAll ? { opacity: fadeOpacities[idx] ?? 1 } : {}}
          >
            <Link href={`/review/${review.id}`} className="block w-full h-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600 hover:underline">
                  {productNames[review.productId] || "View Product"}
                </span>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 text-sm text-gray-700">{review.reviewText}</div>
              <div className="mt-2 flex gap-4 text-sm">
                <span title="Value Rating">💰 {review.valueRating}</span>
                <span title="Quality Rating">🍎 {review.qualityRating}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!showAll && sortedReviews.length > 3 && (
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
  );
}

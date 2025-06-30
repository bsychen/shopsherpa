import { useEffect, useState } from "react";
import { getUserReviews, getProduct } from "@/lib/api";
import { Review } from "@/types/review";
import Link from "next/link";
import { colours } from "@/styles/colours";

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
        if (product && product.productName) names[id] = product.productName;
      }));
      setProductNames(names);
    }
    if (reviews.length) fetchProductNames();
  }, [reviews]);

  /* Remove loading spinner and always render the list, but apply blur/opacity when loading */
  if (!reviews.length && !loading) return <div style={{ color: colours.text.muted }}>No reviews yet.</div>;

  /* Sort reviews by createdAt descending */
  const sortedReviews = [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);
  const fadeOpacities = [1, 0.7, 0.4];

  return (
    <div className={`transition-all duration-300 ${loading ? 'opacity-40 blur-[2px] pointer-events-none select-none' : 'opacity-100 blur-0'}`}>
      <ul className="space-y-3">
        {visibleReviews.map((review, idx) => (
          <li
            key={review.id}
            style={{
              backgroundColor: colours.card.background,
              border: `2px solid ${colours.card.border}`,
              opacity: !showAll ? (fadeOpacities[idx] ?? 1) : 1
            }}
            className="rounded-xl shadow-xl  p-3 transition cursor-pointer"
          >
            <Link href={`/review/${review.id}`} className="block w-full h-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: colours.text.link }}>
                  {productNames[review.productId] || "View Product"}
                </span>
                <span className="text-xs" style={{ color: colours.text.muted }}>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 text-sm" style={{ color: colours.text.secondary }}>{review.reviewText}</div>
              <div className="mt-2 flex gap-4 text-sm">
                <span title="Rating">⭐ {review.rating}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!showAll && sortedReviews.length > 3 && (
        <div className="flex justify-center mt-3">
          <button
            className="px-4 py-2 rounded text-sm transition"
            style={{
              backgroundColor: colours.button.secondary.background,
              color: colours.button.secondary.text,
            }}
            onClick={() => setShowAll(true)}
          >
            See more
          </button>
        </div>
      )}
    </div>
  );
}

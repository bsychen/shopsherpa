"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getReview, updateReview } from "@/lib/api";
import { Review } from "@/types/review";

export default function UpdateReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [valueRating, setValueRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReview(id).then((data) => {
      if (data) {
        setReview(data);
        setValueRating(data.valueRating || 0);
        setQualityRating(data.qualityRating || 0);
        setReviewText(data.reviewText || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const result = await updateReview(id, valueRating, qualityRating, reviewText);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push(`/review/${id}`), 1200);
    } else {
      setError(result.error || "Failed to update review");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-40">Loading...</div>;
  if (!review) return <div className="flex justify-center items-center h-40 text-red-500">Review not found</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-8 flex flex-col min-h-[400px]">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Update Your Review</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-semibold text-gray-700">Value Rating:</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map((val) => (
              <button
                type="button"
                key={val}
                className={`text-2xl ${valueRating >= val ? '' : 'opacity-30'}`}
                onClick={() => setValueRating(val)}
                aria-label={`Set value rating to ${val}`}
              >💰</button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold text-gray-700">Quality Rating:</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map((val) => (
              <button
                type="button"
                key={val}
                className={`text-2xl ${qualityRating >= val ? '' : 'opacity-30'}`}
                onClick={() => setQualityRating(val)}
                aria-label={`Set quality rating to ${val}`}
              >🍎</button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold text-gray-700">Review Text:</label>
          <textarea
            className="w-full border border-zinc-300 rounded p-2 mt-1"
            rows={4}
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Update your review..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition mt-2"
        >
          Update Review
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">Review updated! Redirecting...</div>}
      </form>
    </div>
  );
}

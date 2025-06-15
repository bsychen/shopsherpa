"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getReview, updateReview } from "@/lib/api";
import { Review } from "@/types/review";
import { colours } from "@/styles/colours";
import LoadingAnimation from "@/components/LoadingSpinner";
import StarIcon from "@/components/Icons";

export default function UpdateReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
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
        setRating(data.rating || 0);
        setReviewText(data.reviewText || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const result = await updateReview(id, rating, reviewText);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push(`/review/${id}`), 1200);
    } else {
      setError(result.error || "Failed to update review");
    }
  };

  if (loading) return <LoadingAnimation />;
  if (!review) return <div className="flex justify-center items-center h-40" style={{ color: colours.status.error.text }}>Review not found</div>;

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow p-8 flex flex-col min-h-[400px]" style={{ backgroundColor: colours.card.background }}>
      <div className="flex items-center mb-4">
        <a
          href={review ? `/review/${review.id}` : "#"}
          className="flex items-center"
          style={{ color: colours.text.link }}
        >
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">Back to Review</span>
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: colours.text.primary }}>Update Your Review</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-semibold" style={{ color: colours.text.primary }}>Rating:</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map((star) => (
              <button
                type="button"
                key={star}
                className={`transition-colors ${rating >= star ? '' : 'opacity-30'}`}
                onClick={() => setRating(star)}
                aria-label={`Set rating to ${star}`}
              ><StarIcon size={24} /></button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold" style={{ color: colours.text.primary }}>Review Text:</label>
          <textarea
            className="w-full rounded p-2 mt-1"
            style={{ 
              border: `1px solid ${colours.card.border}`,
              backgroundColor: colours.input.background,
              color: colours.input.text
            }}
            rows={4}
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Update your review..."
          />
        </div>
        <button
          type="submit"
          className="font-semibold py-2 px-4 rounded transition mt-2"
          style={{
            backgroundColor: colours.button.primary.background,
            color: colours.button.primary.text
          }}
        >
          Update Review
        </button>
        {error && <div className="text-sm mt-2" style={{ color: colours.status.error.text }}>{error}</div>}
        {success && <div className="text-sm mt-2" style={{ color: colours.status.success.text }}>Review updated! Redirecting...</div>}
      </form>
    </div>
  );
}

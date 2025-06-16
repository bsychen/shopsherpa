"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getReview, updateReview } from "@/lib/api";
import { Review } from "@/types/review";
import { colours } from "@/styles/colours";
import ContentBox from "@/components/ContentBox";
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
  if (!review) return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colours.background.secondary }}
    >
      <div className="max-w-md mx-auto pt-10 px-4">
        <ContentBox>
          <div className="text-center" style={{ color: colours.status.error.text }}>
            Review not found
          </div>
        </ContentBox>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colours.background.secondary }}
    >
      <div className="max-w-md mx-auto pt-10 px-4">
        <ContentBox>
          <div className="flex items-center mb-6">
            <a
              href={review ? `/review/${review.id}` : "#"}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: colours.text.link }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Back to Review
            </a>
          </div>
          
          <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: colours.text.primary }}>
            Update Your Review
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: colours.text.primary }}
              >
                Rating
              </label>
              <div className="flex space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`transition-all hover:scale-110 ${rating >= star ? '' : 'opacity-30'}`}
                    onClick={() => setRating(star)}
                    aria-label={`Set rating to ${star}`}
                  >
                    <StarIcon size={28} />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: colours.text.primary }}
              >
                Review Text
              </label>
              <textarea
                className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  border: `1px solid ${colours.card.border}`,
                  backgroundColor: colours.input.background,
                  color: colours.input.text
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = colours.input.focus.ring;
                  e.currentTarget.style.borderColor = colours.input.focus.border;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colours.card.border;
                }}
                rows={5}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Update your review..."
                maxLength={1000}
              />
              <div className="mt-1 text-xs" style={{ color: colours.text.muted }}>
                {reviewText.length}/1000 characters
              </div>
            </div>
            
            {error && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ 
                  backgroundColor: colours.status.error.background,
                  color: colours.status.error.text,
                  border: `1px solid ${colours.status.error.border}`
                }}
              >
                {error}
              </div>
            )}
            
            {success && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ 
                  backgroundColor: colours.status.success.background,
                  color: colours.status.success.text,
                  border: `1px solid ${colours.status.success.border}`
                }}
              >
                ✓ Review updated! Redirecting...
              </div>
            )}
            
            <button
              type="submit"
              className="w-full font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-60"
              style={{
                backgroundColor: colours.button.primary.background,
                color: colours.button.primary.text
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colours.button.primary.hover.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colours.button.primary.background;
              }}
            >
              Update Review
            </button>
          </form>
        </ContentBox>
      </div>
    </div>
  );
}

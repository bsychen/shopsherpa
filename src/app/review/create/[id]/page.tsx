"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { getProduct, createReview } from "@/lib/api";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";
import ContentBox from "@/components/ContentBox";
import LoadingAnimation from "@/components/LoadingSpinner";
import StarIcon from "@/components/Icons";

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        // Save intended path for post-auth redirect
        localStorage.setItem("postAuthRedirect", `/review/create/${id}`);
        router.push("/auth");
      }
    });
    return () => unsub();
  }, [router, id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      if (!user?.uid) throw new Error("User not authenticated");
      if (!rating) throw new Error("Please select a rating");

      await createReview(id, user.uid, reviewText, rating, isAnonymous);
      setSubmitSuccess(true);
      setReviewText("");
      setRating(0);
      setIsAnonymous(false);
    } catch (err) {
      setSubmitError((err as Error).message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!user) {
    return <LoadingAnimation />;
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colours.background.secondary }}
    >
      <div className="max-w-md mx-auto pt-10 px-4">
        <ContentBox>          <div className="flex items-center mb-4">
            <a 
              href={`/product/${id}`} 
              className="flex items-center"
              style={{ color: colours.text.link }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </a>
          </div>
          {product && (
            <div className="mb-4">
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: colours.text.primary }}
              >
                {product.productName}
              </div>
              <div style={{ color: colours.text.secondary }}>
                What you should be paying: 
                <span 
                  className="font-bold"
                  style={{ color: colours.score.high }}
                >
                  £{product.price?.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: colours.text.primary }}
          >
            Write a Review
          </h1>
      {submitSuccess ? (
        <div className="text-center space-y-4">
          <div 
            className="p-4 rounded-lg text-lg font-medium"
            style={{ 
              backgroundColor: colours.status.success.background,
              color: colours.status.success.text,
              border: `1px solid ${colours.status.success.border}`
            }}
          >
            ✓ Review submitted successfully!
          </div>
          <button
            className="w-full font-semibold py-3 px-4 rounded-lg transition-all"
            style={{
              backgroundColor: colours.button.secondary.background,
              color: colours.button.secondary.text
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colours.button.secondary.background;
            }}
            onClick={() => router.push(`/product/${id}`)}
          >
            Back to {product?.productName || 'Product'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: colours.text.primary }}
              >
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`transition-all hover:scale-110 ${rating >= star ? '' : 'opacity-30'}`}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <StarIcon size={28} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: colours.text.primary }}
              >
                Review
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-lg p-3 focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: colours.input.background,
                  borderColor: colours.input.border,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: colours.input.text
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = colours.input.focus.ring;
                  e.currentTarget.style.borderColor = colours.input.focus.border;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colours.input.border;
                }}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
                maxLength={1000}
                placeholder="Share your thoughts about this product... What did you like? What could be improved?"
              />
              <div className="mt-1 text-xs" style={{ color: colours.text.muted }}>
                {reviewText.length}/1000 characters
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded w-4 h-4"
                  style={{
                    accentColor: colours.button.primary.background
                  }}
                />
                <span 
                  className="text-sm"
                  style={{ color: colours.text.primary }}
                >
                  Post anonymously
                </span>
              </label>
            </div>
          </div>
          {submitError && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: colours.status.error.background,
                color: colours.status.error.text,
                border: `1px solid ${colours.status.error.border}`
              }}
            >
              {submitError}
            </div>
          )}
          <button
            type="submit"
            className="w-full font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colours.button.primary.background,
              color: colours.button.primary.text
            }}
            disabled={submitting || rating === 0}
            onMouseEnter={(e) => {
              if (!submitting && rating > 0) {
                e.currentTarget.style.backgroundColor = colours.button.primary.hover.background;
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && rating > 0) {
                e.currentTarget.style.backgroundColor = colours.button.primary.background;
              }
            }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>          )}
        </ContentBox>
      </div>
    </div>
  );
}
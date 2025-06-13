"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { getProduct, createReview } from "@/lib/api";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";

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
    return (
      <div className="flex justify-center items-center h-40">
        <span style={{ color: colours.text.muted }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-40">
        <span style={{ color: colours.text.muted }}>Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className="max-w-md mx-auto mt-10 rounded-xl shadow p-8"
      style={{
        backgroundColor: colours.card.background,
        border: `1px solid ${colours.card.border}`
      }}
    >
      <div className="flex items-center mb-4">
        <a 
          href={`/product/${id}`} 
          className="flex items-center hover:underline"
          style={{ color: colours.text.link }}
        >
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">Go back to {product?.productName || 'product'}</span>
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
        <>
          <div 
            className="text-lg mb-4"
            style={{ color: colours.status.success.text }}
          >
            Review submitted!
          </div>
          <button
            className="w-full font-semibold py-2 px-4 rounded transition"
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
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-4">
              <div 
                className="mb-2 font-semibold"
                style={{ color: colours.text.primary }}
              >
                Quality:
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`text-2xl transition-colors ${rating >= star ? '' : 'opacity-30'}`}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{
                    accentColor: colours.button.primary.background
                  }}
                  className="rounded"
                />
                <span 
                  className="text-sm"
                  style={{ color: colours.text.primary }}
                >
                  Post anonymously
                </span>
              </label>
            </div>
            <textarea
              className="w-full min-h-[100px] rounded p-2 focus:outline-none"
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
              placeholder="Share your thoughts about this product..."
            />
          </div>
          {submitError && (
            <div 
              className="text-sm"
              style={{ color: colours.status.error.text }}
            >
              {submitError}
            </div>
          )}
          <button
            type="submit"
            className="w-full font-semibold py-2 px-4 rounded transition disabled:opacity-60"
            style={{
              backgroundColor: colours.button.primary.background,
              color: colours.button.primary.text
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = colours.button.primary.hover.background;
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = colours.button.primary.background;
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
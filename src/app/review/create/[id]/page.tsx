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
import { useTopBar } from "@/contexts/TopBarContext";
import Image from "next/image";
import Link from "next/link";

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
  const { setTopBarState, resetTopBar } = useTopBar();

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

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
      onBackClick: () => router.push(`/product/${id}`)
    });

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router, id]);

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
      
      // Redirect back to product page after a short delay
      setTimeout(() => {
        router.push(`/product/${id}`);
      }, 2000);
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
      <div className="max-w-md mx-auto pt-10 px-4 space-y-4">
        {/* Product Information Card */}
        {product && (
          <ContentBox className="opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center space-x-4">
              <Image
                src={product.imageUrl || "/placeholder.jpg"}
                alt={product.productName}
                width={60}
                height={60}
                className="w-15 h-15 object-contain rounded-lg"
              />
              <div className="flex-1">
                <Link href={`/product/${id}`}>
                  <h2 
                    className="text-lg font-semibold mb-1 hover:underline cursor-pointer transition-all"
                    style={{ color: colours.text.link }}
                  >
                    {product.productName}
                  </h2>
                </Link>
                <p 
                  className="text-sm mb-1"
                  style={{ color: colours.text.secondary }}
                >
                  {product.brandName || 'Unknown Brand'}
                </p>
                <p 
                  className="text-xs font-mono"
                  style={{ color: colours.text.muted }}
                >
                  Product ID: {id}
                </p>
              </div>
            </div>
          </ContentBox>
        )}
        
        <ContentBox className="opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
          <div className="flex flex-col items-center space-y-3">
            <LoadingAnimation size="small"/>
            <p 
              className="text-sm"
              style={{ color: colours.text.secondary }}
            >
              Taking you back to product...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`transition-all hover:scale-110 ${rating >= star ? '' : 'opacity-30'}`}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <StarIcon size={40} filled={rating >= star} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
            
            <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
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
              className="p-3 rounded-lg text-sm opacity-0 animate-fade-in"
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
            className="w-full font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed opacity-0 animate-fade-in"
            style={{
              backgroundColor: colours.button.success.background,
              color: colours.button.primary.text,
              animationDelay: '0.6s'
            }}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
        </ContentBox>
      </div>
    </div>
  );
}
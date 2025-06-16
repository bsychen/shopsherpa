"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getReview, updateReview, getProduct } from "@/lib/api";
import { Review } from "@/types/review";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";
import ContentBox from "@/components/ContentBox";
import LoadingAnimation from "@/components/LoadingSpinner";
import StarIcon from "@/components/Icons";
import { useTopBar } from "@/contexts/TopBarContext";
import Image from "next/image";

export default function UpdateReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setTopBarState, resetTopBar } = useTopBar();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReview(id).then((data) => {
      if (data) {
        setReview(data);
        setRating(data.rating || 0);
        setReviewText(data.reviewText || "");
        // Fetch product information
        getProduct(data.productId).then((productData) => {
          setProduct(productData);
        });
      }
      setLoading(false);
    });
  }, [id]);

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
      onBackClick: () => router.push(`/review/${id}`)
    });

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router, id]);

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
        {/* Product Information Card */}
        {product && (
          <ContentBox className="mb-4">
            <div className="flex items-center space-x-4">
              <Image
                src={product.imageUrl || "/placeholder.jpg"}
                alt={product.productName}
                width={60}
                height={60}
                className="w-15 h-15 object-contain rounded-lg"
              />
              <div className="flex-1">
                <h2 
                  className="text-lg font-semibold mb-1"
                  style={{ color: colours.text.primary }}
                >
                  {product.productName}
                </h2>
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
                  Product ID: {review.productId}
                </p>
              </div>
            </div>
          </ContentBox>
        )}

        <ContentBox>
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: colours.text.primary }}
          >
            Update Your Review
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`transition-all hover:scale-110 ${rating >= star ? '' : 'opacity-30'}`}
                      onClick={() => setRating(star)}
                      aria-label={`Set rating to ${star}`}
                    >
                      <StarIcon size={40} />
                    </button>
                  ))}
                </div>
              </div>
            
              <div className="mb-6">
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
                  placeholder="Update your review..."
                  maxLength={1000}
                />
                <div className="mt-1 text-xs" style={{ color: colours.text.muted }}>
                  {reviewText.length}/1000 characters
                </div>
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

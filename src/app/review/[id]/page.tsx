"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { Review } from "@/types/review";
import { Product } from "@/types/product";
import { getReview, getProduct, getUserById } from "@/lib/api";
import { colours } from "@/styles/colours";
import LoadingAnimation from "@/components/LoadingSpinner";
import ContentBox from "@/components/ContentBox";
import StarIcon from "@/components/Icons";
import { useTopBar } from "@/contexts/TopBarContext";
import Image from "next/image";
import { Trash2, Edit3 } from "lucide-react";

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setTopBarState, resetTopBar } = useTopBar();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // No redirect for unauthenticated users
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReview(id).then((data) => {
      if (data) {
        setReview({
          id: data.id ?? id,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          productId: data.productId,
          reviewText: data.reviewText || undefined,
          rating: data.rating,
          userId: data.userId,
          isAnonymous: data.isAnonymous || false,
        });
      } else {
        setReview(null);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !review) return;
    getProduct(review.productId).then((productData) => {
      setProduct(productData);
    });
    // Fetch username from userId (unless anonymous)
    if (review.userId && !review.isAnonymous) {
      getUserById(review.userId).then((user) => {
        if (user && typeof user.username === "string") setUsername(user.username);
        else setUsername("");
      });
    } else if (review.isAnonymous) {
      setUsername("anon");
    }
  }, [review, id]);

  // Set up back button in top bar
  useEffect(() => {
    if (review) {
      setTopBarState({
        showBackButton: true,
        onBackClick: () => router.push(`/product/${review.productId}`)
      });
    }

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router, review]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!review) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-red-500">Review not found</span>
      </div>
    );
  }

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
                <p 
                  className="text-xs font-mono"
                  style={{ color: colours.text.muted }}
                >
                  Review ID: {review.id}
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
            {username ? `${username} says...` : "User says..."}
          </h1>
          
          {/* Rating Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`inline-block ${
                    review.rating >= star ? "" : "opacity-30"
                  }`}
                  role="img"
                  aria-label="star"
                >
                  <StarIcon size={40} />
                </span>
              ))}
            </div>
          </div>

          {/* Review Text Section */}
          <div className="mb-6">
            <div 
              className="w-full min-h-[120px] rounded-lg p-3"
              style={{
                backgroundColor: colours.input.background,
                borderColor: colours.input.border,
                borderWidth: '1px',
                borderStyle: 'solid',
                color: colours.input.text
              }}
            >
              {review.reviewText || "(No review text)"}
            </div>
          </div>
          {/* Action buttons for review owner */}
          {user && user.uid === review.userId && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this review?")) {
                    const res = await import("@/lib/api").then(m => m.deleteReview(review.id));
                    if (res.success) {
                      router.push(`/product/${review.productId}`);
                    } else {
                      alert(res.error || "Failed to delete review");
                    }
                  }
                }}
                className="flex items-center justify-center w-8 h-8 rounded transition-all"
                style={{
                  backgroundColor: colours.status.error.background,
                  color: colours.status.error.text,
                  border: `1px solid ${colours.status.error.border}`
                }}
                aria-label="Delete review"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => router.push(`/review/update/${review.id}`)}
                className="flex items-center justify-center w-8 h-8 rounded transition-all"
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
                aria-label="Edit review"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
                          <div
                  className="text-xs font-mono"
                  style={{ color: colours.text.muted }}
                >
                  Review ID: {review.id}
                </div>
        </ContentBox>
      </div>
    </div>
  );
}
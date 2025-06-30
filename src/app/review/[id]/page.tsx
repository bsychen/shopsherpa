"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Review } from "@/types/review";
import { Product } from "@/types/product";
import { getReview, getProduct, getUserById, updateReview as _updateReview } from "@/lib/api";
import { colours } from "@/styles/colours";
import LoadingAnimation from "@/components/LoadingSpinner";
import ContentBox from "@/components/community/ContentBox";
import StarIcon from "@/components/Icons";
import { useTopBar } from "@/contexts/TopBarContext";
import Image from "next/image";
import EditButton from "@/components/buttons/EditButton";
import DeleteButton from "@/components/buttons/DeleteButton";

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localRating, setLocalRating] = useState<number>(0);
  const [localReviewText, setLocalReviewText] = useState<string>("");
  const router = useRouter();
  const { setTopBarState, resetTopBar } = useTopBar();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      /* No redirect for unauthenticated users */
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReview(id).then((data) => {
      if (data) {
        const reviewData = {
          id: data.id ?? id,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          productId: data.productId,
          reviewText: data.reviewText || undefined,
          rating: data.rating,
          userId: data.userId,
          isAnonymous: data.isAnonymous || false,
        };
        setReview(reviewData);
        /* Initialize local state with current values */
        setLocalRating(reviewData.rating);
        setLocalReviewText(reviewData.reviewText || "");
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
    /* Fetch username from userId (unless anonymous) */
    if (review.userId && !review.isAnonymous) {
      getUserById(review.userId).then((user) => {
        if (user && typeof user.username === "string") setUsername(user.username);
        else setUsername("");
      });
    } else if (review.isAnonymous) {
      setUsername("anon");
    }
  }, [review, id]);

  /* Set up back button in top bar */
  useEffect(() => {
    if (review) {
      setTopBarState({
        showBackButton: true,
        onBackClick: () => router.push(`/product/${review.productId}`)
      });
    }

    /* Cleanup when component unmounts */
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router, review]);

  /* Editing functions */
  const handleSaveChanges = async () => {
    if (!review) return;
    
    setIsUpdating(true);
    try {
      /* Update review directly in Firestore for real-time updates */
      const reviewRef = doc(db, 'reviews', review.id);
      const updateData: { [key: string]: number | Date | string } = {
        rating: localRating,
        updatedAt: new Date(),
      };
      
      if (localReviewText.trim()) {
        updateData.reviewText = localReviewText.trim();
      }

      await updateDoc(reviewRef, updateData);
      
      /* Update the local review state with new values */
      setReview(prev => prev ? {
        ...prev,
        rating: localRating,
        reviewText: localReviewText || undefined
      } : null);
      setIsEditMode(false);
      
    } catch (error) {
      console.error('Error updating review:', error);
      alert("Failed to update review");
      /* Reset local state on failure */
      setLocalRating(review.rating);
      setLocalReviewText(review.reviewText || "");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (!review) return;
    
    /* Reset local state to original values */
    setLocalRating(review.rating);
    setLocalReviewText(review.reviewText || "");
    setIsEditMode(false);
  };

  const hasChanges = review && (
    localRating !== review.rating || 
    localReviewText !== (review.reviewText || "")
  );

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
                <Link href={`/product/${review.productId}`}>
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
                  Product ID: {review.productId}
                </p>
              </div>
            </div>
          </ContentBox>
        )}

        <ContentBox className="opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 
            className="text-2xl font-bold mb-4 opacity-0 animate-fade-in"
            style={{ color: colours.text.primary, animationDelay: '0.3s' }}
          >
            {username ? `${username} says...` : "User says..."}
          </h1>
          
          {/* Rating Section */}
          <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className={`flex items-center justify-center space-x-2 transition-all duration-300 ${
              isEditMode ? 'transform scale-105 rounded-lg p-2' : ''
            }`}
            style={isEditMode ? { backgroundColor: colours.card.background } : {}}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`inline-block transition-all duration-200 ${
                    (isEditMode ? localRating : review.rating) >= star ? "drop-shadow-md" : "opacity-30"
                  } ${isEditMode ? "cursor-pointer hover:scale-110 hover:drop-shadow-lg" : ""}`}
                  role="img"
                  aria-label="star"
                  onClick={isEditMode ? () => setLocalRating(star) : undefined}
                >
                  <StarIcon size={40} filled={(isEditMode ? localRating : review.rating) >= star} />
                </span>
              ))}
            </div>
            {isEditMode && (
              <div className="text-center mt-2 text-sm animate-fade-in" style={{ color: colours.text.muted }}>
                Click stars to rate
              </div>
            )}
          </div>

          {/* Review Text Section */}
          <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {isEditMode ? (
              <div className="animate-fade-in">
                <textarea
                  value={localReviewText}
                  onChange={(e) => setLocalReviewText(e.target.value)}
                  className="w-full min-h-[120px] rounded-lg p-3 resize-none transition-all duration-300 transform scale-105 shadow-lg"
                  style={{
                    backgroundColor: colours.input.background,
                    borderColor: colours.input.border,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    color: colours.input.text
                  }}
                  placeholder="Share your thoughts about this product..."
                  disabled={isUpdating}
                  autoFocus
                />
                <div className="text-right mt-1 text-xs" style={{ color: colours.text.muted }}>
                  {localReviewText.length} characters
                </div>
              </div>
            ) : (
              <div 
                className="w-full min-h-[120px] rounded-lg p-3 transition-all duration-300"
                style={{
                  backgroundColor: colours.input.background,
                  borderColor: colours.input.border,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  color: colours.input.text
                }}
              >
                {review.reviewText || "(No review text)"}
              </div>
            )}
          </div>
          {/* Action buttons for review owner */}
          {user && user.uid === review.userId && (
            <div className="flex justify-end gap-2 mt-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="min-w-[80px]">
                <DeleteButton
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this review?")) {
                      try {
                        /* Delete review directly from Firestore for real-time updates */
                        const reviewRef = doc(db, 'reviews', review.id);
                        await deleteDoc(reviewRef);
                        router.push(`/product/${review.productId}`);
                      } catch (error) {
                        console.error('Error deleting review:', error);
                        alert("Failed to delete review");
                      }
                    }
                  }}
                  disabled={isUpdating}
                />
              </div>
              <div className="min-w-[80px]">
                <EditButton
                  isEditMode={isEditMode}
                  onToggle={isEditMode ? (hasChanges ? handleSaveChanges : handleCancelEdit) : () => setIsEditMode(true)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          )}
                          <div
                  className="text-xs mt-4 font-mono opacity-0 animate-fade-in"
                  style={{ color: colours.text.muted, animationDelay: '0.7s' }}
                >
                  Review ID: {review.id}
                </div>
        </ContentBox>
      </div>
    </div>
  );
}
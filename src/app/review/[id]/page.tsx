"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { Review } from "@/types/review";
import { getReview, getProduct, getUserById } from "@/lib/api";
import { colours } from "@/styles/colours";

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    getProduct(review.productId).then((product) => {
      setProductName(product?.productName || "");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
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
      className="max-w-md mx-auto mt-10 rounded-xl shadow p-8"
      style={{
        backgroundColor: colours.card.background,
        border: `1px solid ${colours.card.border}`
      }}
    >
      <div className="flex items-center mb-4">
        <a
          href={productName ? `/product/${review.productId}` : "#"}
          className="flex items-center hover:underline"
          style={{ color: colours.text.link }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </a>
      </div>
      <div className="mb-2 flex items-center">
        <span 
          className="font-bold text-2xl min-w-[110px]"
          style={{ color: colours.text.primary }}
        >
          {username ? `${username} says...` : "User says..."}
        </span>
      </div>
      <div className="mb-2 flex items-center">
        <span 
          className="font-semibold min-w-[110px] text-sm"
          style={{ color: colours.text.secondary }}
        >
          Rating:
        </span>
        <span className="ml-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${
                review.rating >= star ? "" : "opacity-30"
              }`}
              role="img"
              aria-label="star"
            >
              ⭐
            </span>
          ))}
        </span>
      </div>
      <div className="mb-2 flex">
        <div 
          className="ml-2 rounded p-3 mt-1 w-full"
          style={{
            backgroundColor: colours.content.surfaceSecondary,
            border: `1px solid ${colours.content.border}`,
            color: colours.text.primary
          }}
        >
          {review.reviewText || "(No review text)"}
        </div>
      </div>
      {/* Action buttons for review owner */}
      {user && user.uid === review.userId && (
        <div className="flex gap-2 mt-3">
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
            className="font-medium py-1 px-3 rounded text-xs transition"
            style={{
              backgroundColor: colours.status.error.background,
              color: colours.status.error.text,
              border: `1px solid ${colours.status.error.border}`
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.danger.hover.background}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.status.error.background}
          >
            Delete
          </button>
          <button
            onClick={() => router.push(`/review/update/${review.id}`)}
            className="font-medium py-1 px-3 rounded text-xs transition"
            style={{
              backgroundColor: colours.status.info.background,
              color: colours.status.info.text,
              border: `1px solid ${colours.status.info.border}`
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.hover.background}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.status.info.background}
          >
            Edit
          </button>
        </div>
      )}
      <div 
        className="mt-6 text-xs text-left"
        style={{ color: colours.text.muted }}
      >
        <div>Review ID: {review.id}</div>
        <div>Product ID: {review.productId}</div>
      </div>
    </div>
  );
}
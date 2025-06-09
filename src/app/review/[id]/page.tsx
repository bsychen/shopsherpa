"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { Review } from "@/types/review";
import { getReview, getProduct, getUserById } from "@/lib/api";

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
          valueRating: data.valueRating,
          qualityRating: data.qualityRating,
          userId: data.userId,
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
    // Fetch username from userId
    if (review.userId) {
      getUserById(review.userId).then((user) => {
        if (user && typeof user.username === "string") setUsername(user.username);
        else setUsername("");
      });
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
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-8">
      <div className="flex items-center mb-4">
        <a
          href={productName ? `/product/${review.productId}` : "#"}
          className="flex items-center text-blue-600 hover:underline"
        >
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">
            Go back to {productName || "..."}
          </span>
        </a>
      </div>
      <div className="mb-2 flex items-center">
        <span className="font-bold text-zinc-800 text-2xl min-w-[110px]">
          {username ? `${username} says...` : "User says..."}
        </span>
      </div>
      <div className="mb-2 flex items-center">
        <span className="font-semibold text-gray-700 min-w-[110px] text-sm">
          Value Rating:
        </span>
        <span className="ml-4">
          {[1, 2, 3, 4, 5].map((bag) => (
            <span
              key={bag}
              className={`text-2xl ${
                review.valueRating >= bag ? "" : "opacity-30"
              }`}
              role="img"
              aria-label="money-bag"
            >
              💰
            </span>
          ))}
        </span>
      </div>
      <div className="mb-2 flex items-center">
        <span className="font-semibold text-gray-700 min-w-[110px] text-sm">
          Quality Rating:
        </span>
        <span className="ml-4">
          {[1, 2, 3, 4, 5].map((apple) => (
            <span
              key={apple}
              className={`text-2xl ${
                review.qualityRating >= apple ? "" : "opacity-30"
              }`}
              role="img"
              aria-label="apple"
            >
              🍎
            </span>
          ))}
        </span>
      </div>
      <div className="mb-2 flex">
        <div className="ml-2 text-gray-900 bg-zinc-100 rounded p-3 border border-zinc-200 mt-1 w-full">
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
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 rounded text-xs border border-red-200 transition"
          >
            Delete
          </button>
          <button
            onClick={() => router.push(`/review/update/${review.id}`)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-3 rounded text-xs border border-blue-200 transition"
          >
            Edit
          </button>
        </div>
      )}
      <div className="mt-6 text-xs text-gray-400 text-left">
        <div>Review ID: {review.id}</div>
        <div>Product ID: {review.productId}</div>
      </div>
    </div>
  );
}
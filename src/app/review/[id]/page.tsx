"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { Review } from "@/types/reviews";
import { getReview } from "@/lib/api";

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push("/auth");
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReview(id).then((data) => {
      // Normalize review fields to match the updated Review type
      if (data) {
        setReview({
          Id: data.Id ?? id, // fallback to URL id if not present
          CreatedAt: data.CreatedAt ? new Date(data.CreatedAt) : new Date(),
          ProductId: data.ProductId,
          ReviewText: data.ReviewText || undefined,
          Rating: data.Rating,
          UserId: data.UserId,

        });
      } else {
        setReview(null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
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
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Review</h1>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Review ID:</span>
        <span className="ml-2 text-gray-900">{review.Id}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Product ID:</span>
        <span className="ml-2 text-gray-900">{review.ProductId}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">User ID:</span>
        <span className="ml-2 text-gray-900">{review.UserId}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Rating:</span>
        <span className="ml-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-2xl ${review.Rating >= star ? 'text-yellow-400' : 'text-zinc-300'}`}>★</span>
          ))}
        </span>
      </div>
      <div className="mb-2">
        <div className="ml-2 text-gray-900 bg-zinc-100 rounded p-3 border border-zinc-200 mt-1">
          {review.ReviewText || "(No review text)"}
        </div>
      </div>
    </div>
  );
}
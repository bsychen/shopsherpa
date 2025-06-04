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
      if (data) {
        setReview({
          id: data.id ?? id,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          productId: data.productId,
          reviewText: data.reviewText || undefined,
          valueRating: data.valueRating,
          qualityRating: data.qualityRating,
          userId: data.userId,
          username: data.username,
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
        <span className="ml-2 text-gray-900">{review.id}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Product ID:</span>
        <span className="ml-2 text-gray-900">{review.productId}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">User:</span>
        <span className="ml-2 text-gray-900">{review.username}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Value Rating:</span>
        <span className="ml-2">
          {[1, 2, 3, 4, 5].map((bag) => (
            <span key={bag} className={`text-2xl ${review.valueRating >= bag ? '' : 'opacity-30'}`} role="img" aria-label="money-bag">💰</span>
          ))}
        </span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-gray-700">Quality Rating:</span>
        <span className="ml-2">
          {[1, 2, 3, 4, 5].map((apple) => (
            <span key={apple} className={`text-2xl ${review.qualityRating >= apple ? '' : 'opacity-30'}`} role="img" aria-label="apple">🍎</span>
          ))}
        </span>
      </div>
      <div className="mb-2">
        <div className="ml-2 text-gray-900 bg-zinc-100 rounded p-3 border border-zinc-200 mt-1">
          {review.reviewText || "(No review text)"}
        </div>
      </div>
    </div>
  );
}
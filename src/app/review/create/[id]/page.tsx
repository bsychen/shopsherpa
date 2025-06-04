"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useParams } from "next/navigation";
import { getProduct, createReview, getUserById } from "@/lib/api";
import { Product } from "@/types/product";

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
  const [valueRating, setValueRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
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
      if (!valueRating) throw new Error("Please select a value rating");
      if (!qualityRating) throw new Error("Please select a quality rating");

      const userDoc = await getUserById(user.uid);
      const username = userDoc.username;
      await createReview(id, user.uid, reviewText, username, valueRating, qualityRating);
      setSubmitSuccess(true);
      setReviewText("");
      setValueRating(0);
      setQualityRating(0);
    } catch (err) {
      setSubmitError((err as Error).message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-8">
      {product && (
        <div className="mb-4">
          <div className="text-lg font-semibold text-zinc-800 mb-1">{product.name}</div>
          <div className="text-zinc-700">What you should be paying: <span className="font-bold text-green-600">£{product.dbPrice?.toFixed(2)}</span></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Write a Review</h1>
      {submitSuccess ? (
        <>
          <div className="text-green-600 text-lg mb-4">Review submitted!</div>
          <button
            className="w-full bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold py-2 px-4 rounded transition"
            onClick={() => router.push(`/product/${id}`)}
          >
            Back to Product
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex flex-row gap-8 mb-4">
              <div>
                <div className="mb-2 font-semibold text-zinc-700">Value Rating:</div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((bag) => (
                    <button
                      type="button"
                      key={bag}
                      className={`text-2xl transition-colors ${valueRating >= bag ? '' : 'opacity-30'}`}
                      onClick={() => setValueRating(bag)}
                      aria-label={`Rate value ${bag} money bag${bag > 1 ? 's' : ''}`}
                    >
                      💰
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 font-semibold text-zinc-700">Quality Rating:</div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((apple) => (
                    <button
                      type="button"
                      key={apple}
                      className={`text-2xl transition-colors ${qualityRating >= apple ? '' : 'opacity-30'}`}
                      onClick={() => setQualityRating(apple)}
                      aria-label={`Rate quality ${apple} apple${apple > 1 ? 's' : ''}`}
                    >
                      🍎
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              className="w-full min-h-[100px] border border-zinc-300 rounded p-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              required
              maxLength={1000}
            />
          </div>
          {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
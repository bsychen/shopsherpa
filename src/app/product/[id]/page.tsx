"use client"

import { useState, useEffect, use } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/review"
import { getProduct, getProductReviews } from "@/lib/api"
import Link from "next/link"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    setLoading(true)
    getProduct(id).then((data) => {
      setProduct(data)
      setLoading(false)
    })
    getProductReviews(id).then((data) => setReviews(data || []));
    // Auth state listener for showing the create review button
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, [id])

  // Fetch usernames for all unique userId in reviews
  useEffect(() => {
    async function fetchUsernames() {
      const ids = Array.from(new Set(reviews.map(r => r.userId)));
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async (uid) => {
        if (!uid) return;
        try {
          const user = await import("@/lib/api").then(m => m.getUserById(uid));
          if (user && typeof user.username === "string") names[uid] = user.username;
        } catch {}
      }));
      setUsernames(names);
    }
    if (reviews.length) fetchUsernames();
  }, [reviews])

  const handleWriteReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push(`/review/create/${id}`);
    } else {
      // Save intended path and redirect to auth
      localStorage.setItem("postAuthRedirect", `/review/create/${id}`);
      router.push("/auth");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
        <div className="text-lg text-zinc-700">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
        <div className="text-lg text-red-600 mb-4">Product not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-6 flex flex-col items-center border border-zinc-200 relative">
        <div className="absolute left-6 top-6">
          <Link href="/" className="flex items-center text-blue-600 hover:underline">
            <span className="mr-2 text-2xl">&#8592;</span>
            <span className="font-semibold">Go back home</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center text-zinc-800 mt-10">{product.name}</h1>
        <div className="text-lg text-zinc-700 mb-2">What you should be paying:</div>
        <div className="text-3xl font-semibold text-green-600 mb-2">£{product.dbPrice.toFixed(2)}</div>
        {/* Reviews Section */}
        <div className="w-full mt-6">
          <h2 className="text-xl font-semibold mb-2 text-zinc-800">Reviews</h2>
          {reviews.length === 0 ? (
            <div className="text-zinc-500">No reviews yet.</div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Link href={`/review/${review.id}`} className="block bg-white rounded-lg border border-zinc-200 shadow-sm p-4 hover:bg-zinc-50 transition cursor-pointer">
                    <div className="font-bold text-zinc-700 mb-1">{usernames[review.userId] || "User"}</div>
                    <div className="flex flex-row items-center gap-4 mb-1">
                      <span className="flex items-center">
                        {[1, 2, 3, 4, 5].map((bag) => (
                          <span
                            key={bag}
                            className={`text-xl ${review.valueRating >= bag ? '' : 'opacity-30'}`}
                            role="img"
                            aria-label="money-bag"
                          >
                            💰
                          </span>
                        ))}
                      </span>
                      <span className="flex items-center">
                        {[1, 2, 3, 4, 5].map((apple) => (
                          <span
                            key={apple}
                            className={`text-xl ${review.qualityRating >= apple ? '' : 'opacity-30'}`}
                            role="img"
                            aria-label="apple"
                          >
                            🍎
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="text-zinc-700 truncate">{review.reviewText || "(No review text)"}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleWriteReview}
              className="inline-flex items-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold py-2 px-4 rounded transition mb-2"
            >
              <span className="mr-2 text-xl font-bold">+</span> Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, use } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/review"
import { getProduct, getProductReviews, getReviewSummary } from "@/lib/api"
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
  const [reviewSummary, setReviewSummary] = useState(null);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [seeMoreClicked, setSeeMoreClicked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true)
    getProduct(id).then((data) => {
      setProduct(data)
      setLoading(false)
    })
    getProductReviews(id).then((data) => setReviews(data || []));
    getReviewSummary(id).then((summary) => setReviewSummary(summary));
    // Auth state listener for showing the create review button
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, [id])

  // Animate the average score ring after reviewSummary loads
  useEffect(() => {
    if (reviewSummary) {
      setTimeout(() => setAnimatedValue(reviewSummary.averageValueRating), 50);
      setTimeout(() => setAnimatedQuality(reviewSummary.averageQualityRating), 50);
    }
  }, [reviewSummary]);

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
          <h2 className="text-xl font-semibold mb-2 text-zinc-800">Community Score:</h2>
          {reviewSummary && (
            <div className="mb-6">
              <div className="flex flex-row justify-between gap-4 md:gap-8">
                {/* Value Box */}
                <div className="w-[48%] max-w-[220px] flex-shrink-0 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative inline-block w-12 h-12 align-middle">
                      <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                        <circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke="#fde047"
                          strokeWidth="5"
                          strokeDasharray={Math.PI * 2 * 20}
                          strokeDashoffset={Math.PI * 2 * 20}
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center center',
                          }}
                        />
                        <circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke="#fde047"
                          strokeWidth="5"
                          strokeDasharray={Math.PI * 2 * 20}
                          strokeDashoffset={Math.PI * 2 * 20 * (1 - (animatedValue / 5))}
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center center',
                          }}
                        />
                      </svg>
                      <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">💰</span>
                    </span>
                    <span className="ml-1 text-xs text-zinc-500">Avg Score: {reviewSummary.averageValueRating.toFixed(2)}</span>
                  </div>
                  <div className="w-full">
                    <div className="font-semibold mb-1 text-xs md:text-base">Value for Money</div>
                    <div className="flex flex-col gap-1 h-auto w-full">
                      {[5,4,3,2,1].map(star => (
                        <div key={star} className="flex items-center mb-0.5">
                          <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                          <div
                            className="bg-yellow-400 rounded h-3 transition-all duration-700 animate-bar-grow"
                            style={{ width: `${Math.max(6, Number(reviewSummary.valueDistribution[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                            title={`${reviewSummary.valueDistribution[star] || 0} review(s) with ${star} star(s)`}
                          ></div>
                          <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.valueDistribution[star] || 0)}</span>
                        </div>
                    ))}
                    </div>
                  </div>
                </div>
                {/* Quality Box */}
                <div className="w-[48%] max-w-[220px] flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative inline-block w-12 h-12 align-middle">
                      <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                        <circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke="#fca5a5"
                          strokeWidth="5"
                          strokeDasharray={Math.PI * 2 * 20}
                          strokeDashoffset={Math.PI * 2 * 20}
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center center',
                          }}
                        />
                        <circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke="#f87171"
                          strokeWidth="5"
                          strokeDasharray={Math.PI * 2 * 20}
                          strokeDashoffset={Math.PI * 2 * 20 * (1 - (animatedQuality / 5))}
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center center',
                          }}
                        />
                      </svg>
                      <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">🍎</span>
                    </span>
                    <span className="ml-1 text-xs text-zinc-500">Avg Score: {reviewSummary.averageQualityRating.toFixed(2)}</span>
                  </div>
                  <div className="w-full">
                    <div className="font-semibold mb-1 text-xs md:text-base">Quality</div>
                    <div className="flex flex-col gap-1 h-auto w-full">
                      {[5,4,3,2,1].map(star => (
                        <div key={star} className="flex items-center mb-0.5">
                          <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                          <div
                            className="bg-red-400 rounded h-3 transition-all duration-700 animate-bar-grow"
                            style={{ width: `${Math.max(6, Number(reviewSummary.qualityDistribution[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                            title={`${reviewSummary.qualityDistribution[star] || 0} review(s) with ${star} star(s)`}
                          ></div>
                          <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.qualityDistribution[star] || 0)}</span>
                        </div>
                    ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="w-full mt-6 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center justify-between w-full mb-2">
              <h2 className="text-xl font-semibold text-zinc-800">Reviews</h2>
              <button
                onClick={handleWriteReview}
                className="inline-flex items-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold py-2 px-4 rounded transition ml-4 mb-0"
              >
                <span className="mr-2 text-xl font-bold">+</span> Write a Review
              </button>
            </div>
            {reviews.length === 0 ? (
              <div className="text-zinc-500">No reviews yet.</div>
            ) : (
              <>
                <ul className="space-y-4">
                  {reviews.slice(0, visibleReviews).map((review, idx) => {
                    let opacity = 1;
                    if (!seeMoreClicked && visibleReviews === 3) {
                      // Fade out: 1st review = 1, 2nd = 0.7, 3rd = 0.4
                      opacity = 1 - idx * 0.3;
                    }
                    return (
                      <li key={review.id} style={{ opacity }}>
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
                    );
                  })}
                </ul>
                {visibleReviews < reviews.length && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        setVisibleReviews(reviews.length);
                        setSeeMoreClicked(true);
                      }}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded font-semibold transition"
                    >
                      See more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this to your global CSS (e.g., globals.css or in a <style jsx global>)
/*
.animate-bar-grow {
  width: 0;
  animation: bar-grow 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes bar-grow {
  from { width: 0; }
  to { width: var(--bar-width, 100px); }
}
*/

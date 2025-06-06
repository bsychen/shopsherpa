"use client"

import { useState, useEffect, use } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/review"
import { getProduct, getProductReviews, getReviewSummary } from "@/lib/api"
import Link from "next/link"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"
import ProductRadarChart from "@/components/ProductRadarChart";

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
  const [filter, setFilter] = useState<{ type: 'value' | 'quality' | null, score: number | null }>({ type: null, score: null });
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'critical' | 'favourable'>('recent');
  const [sortOpen, setSortOpen] = useState(false);
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

  // Call POST API in recents to record the visit (for recently viewed products)
  useEffect(() => {
    async function recordVisit() {
      if (!user) return; // Ensure user is logged in
      try {
        await fetch("/api/products/recents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.uid, productId: id }),
        });
      } catch (error) {
        console.error("Failed to record visit:", error);
      }
    }
    recordVisit();
  }, [id, user]);

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

  // Filtered reviews based on bar click
  const filteredReviews = filter.type && filter.score !== null
    ? reviews.filter(r => (filter.type === 'value' ? r.valueRating : r.qualityRating) === filter.score)
    : reviews;

  // Sort reviews based on sortBy
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (sortBy === 'recent') {
      return bDate - aDate;
    } else if (sortBy === 'critical') {
      // Sort by lowest value+quality sum, then most recent
      const aScore = (a.valueRating || 0) + (a.qualityRating || 0);
      const bScore = (b.valueRating || 0) + (b.qualityRating || 0);
      if (aScore !== bScore) return aScore - bScore;
      return bDate - aDate;
    } else if (sortBy === 'favourable') {
      // Sort by highest value+quality sum, then most recent
      const aScore = (a.valueRating || 0) + (a.qualityRating || 0);
      const bScore = (b.valueRating || 0) + (b.qualityRating || 0);
      if (aScore !== bScore) return bScore - aScore;
      return bDate - aDate;
    }
    return 0;
  });

  // Animate reviews section on filter or sort change
  useEffect(() => {
    if (filter.type !== null || sortOpen === false) {
      setRefreshing(true);
      const timeout = setTimeout(() => setRefreshing(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [filter, sortBy, sortOpen]);

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
        {/* <div className="text-lg text-zinc-700 mb-2">What you should be paying</div>
        <div className="text-3xl font-semibold text-green-600 mb-2">£{product.dbPrice.toFixed(2)}</div> */}
        {/* Spider Web Diagram Box */}
        <div className="w-full max-w-xl flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-full" style={{ minHeight: 220, minWidth: 0 }}>
            <ProductRadarChart
              data={[4, 3, 5, 2, 4]} // Replace with real data if available
              labels={["Price", "Quality", "Nutrition", "Sustainability", "Brand"]}
            />
          </div>
        </div>
        {/* Community Score Section in matching grey box */}
        <div className="w-full max-w-xl flex flex-col items-center mb-2">
          <div className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col items-center relative">
            <h2 className="text-xl font-semibold mb-2 text-zinc-800 absolute top-4 left-4 m-0">Community Score</h2>
            <div className="h-8 w-full" />
            {reviewSummary && (
              <div className="mb-6 w-full">
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
                          <button
                            key={star}
                            className={`flex items-center mb-0.5 w-full group focus:outline-none ${filter.type === 'value' && filter.score === star ? 'ring-2 ring-yellow-400' : ''}`}
                            onClick={() => setFilter(filter.type === 'value' && filter.score === star ? { type: null, score: null } : { type: 'value', score: star })}
                            title={`Show reviews with value score ${star}`}
                            type="button"
                          >
                            <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                            <div
                              className="bg-yellow-400 rounded h-3 transition-all duration-700 animate-bar-grow group-hover:bg-yellow-500"
                              style={{ width: `${Math.max(6, Number(reviewSummary.valueDistribution[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                            ></div>
                            <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.valueDistribution[star] || 0)}</span>
                          </button>
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
                          <button
                            key={star}
                            className={`flex items-center mb-0.5 w-full group focus:outline-none ${filter.type === 'quality' && filter.score === star ? 'ring-2 ring-red-400' : ''}`}
                            onClick={() => setFilter(filter.type === 'quality' && filter.score === star ? { type: null, score: null } : { type: 'quality', score: star })}
                            title={`Show reviews with quality score ${star}`}
                            type="button"
                          >
                            <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                            <div
                              className="bg-red-400 rounded h-3 transition-all duration-700 animate-bar-grow group-hover:bg-red-500"
                              style={{ width: `${Math.max(6, Number(reviewSummary.qualityDistribution[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                            ></div>
                            <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.qualityDistribution[star] || 0)}</span>
                          </button>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Reviews Section */}
        <div className="w-full mt-4">
          <div className={`w-full mt-6 bg-zinc-50 border border-zinc-200 rounded-xl p-4 transition-all duration-300 ${refreshing ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-0'}`}>
            <div className="flex items-center justify-between w-full mb-2">
              <h2 className="text-xl font-semibold text-zinc-800">Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setSortOpen((v) => !v);
                    }}
                    className="inline-flex items-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold px-3 h-10 rounded-lg transition text-sm"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                  >
                    Sort by
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {sortOpen && (
                    <ul className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg z-20" role="listbox">
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 hover:bg-zinc-100 transition-all duration-200 rounded ${sortBy === 'recent' ? 'bg-blue-100 text-blue-700 shadow ring-2 ring-blue-300 scale-[1.04]' : ''}`}
                          onClick={() => { setSortBy('recent'); setSortOpen(false); setRefreshing(true); setTimeout(() => setRefreshing(false), 350); }}
                          role="option"
                          aria-selected={sortBy === 'recent'}
                        >
                          Most Recent
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 hover:bg-zinc-100 transition-all duration-200 rounded ${sortBy === 'critical' ? 'bg-blue-100 text-blue-700 shadow ring-2 ring-blue-300 scale-[1.04]' : ''}`}
                          onClick={() => { setSortBy('critical'); setSortOpen(false); setRefreshing(true); setTimeout(() => setRefreshing(false), 350); }}
                          role="option"
                          aria-selected={sortBy === 'critical'}
                        >
                          Most Critical
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left px-4 py-2 hover:bg-zinc-100 transition-all duration-200 rounded ${sortBy === 'favourable' ? 'bg-blue-100 text-blue-700 shadow ring-2 ring-blue-300 scale-[1.04]' : ''}`}
                          onClick={() => { setSortBy('favourable'); setSortOpen(false); setRefreshing(true); setTimeout(() => setRefreshing(false), 350); }}
                          role="option"
                          aria-selected={sortBy === 'favourable'}
                        >
                          Most Favourable
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
                <button
                  onClick={handleWriteReview}
                  className="inline-flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xl px-4 h-10 rounded-lg transition ml-2 mb-0"
                  aria-label="Write a Review"
                >
                  <span className="w-full flex items-center justify-center" style={{lineHeight: 1}}>
                    <span className="text-xl leading-none flex items-center justify-center">+</span>
                  </span>
                </button>
              </div>
            </div>
            {sortedReviews.length === 0 ? (
              <div className="text-zinc-500">No reviews{filter.type ? ` with ${filter.type} score ${filter.score}` : ''}.</div>
            ) : (
              <>
                <ul className="space-y-4">
                  {sortedReviews.slice(0, visibleReviews).map((review, idx) => {
                    let opacity = 1;
                    if (!seeMoreClicked && visibleReviews === 3 && !filter.type) {
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
                {visibleReviews < sortedReviews.length && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        setVisibleReviews(sortedReviews.length);
                        setSeeMoreClicked(true);
                      }}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded font-semibold transition"
                    >
                      See more
                    </button>
                  </div>
                )}
                {filter.type && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setFilter({ type: null, score: null })}
                      className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-sm border border-zinc-200"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="mt-8 pt-4 w-full text-xs text-gray-400 text-left"> Product ID: {product.id}</div>
      </div>
    </div>
  )
}

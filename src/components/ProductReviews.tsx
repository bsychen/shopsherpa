"use client"

import { Review } from "@/types/review"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { colours } from "@/styles/colours"
import { UserProfile } from "@/types/user"
import StarIcon, { Plus } from "./Icons"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import ContentBox from "./ContentBox"

interface ProductReviewsProps {
  reviews: Review[]
  usernames: Record<string, string>
  user: UserProfile | null
  productId: string
  refreshing: boolean
  visibleReviews: number
  setVisibleReviews: (count: number) => void
  setSeeMoreClicked: (clicked: boolean) => void
  seeMoreClicked: boolean
  filter: { score: number | null }
  setFilter: (filter: { score: number | null }) => void
  sortBy: 'recent' | 'low' | 'high'
  setSortBy: (sortBy: 'recent' | 'low' | 'high') => void
  setRefreshing: (refreshing: boolean) => void
}

export default function ProductReviews({
  reviews,
  usernames,
  user,
  productId,
  refreshing,
  visibleReviews,
  setVisibleReviews,
  setSeeMoreClicked,
  seeMoreClicked,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  setRefreshing
}: ProductReviewsProps) {
  const router = useRouter()

  const handleWriteReview = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      router.push(`/review/create/${productId}`)
    } else {
      localStorage.setItem("postAuthRedirect", `/review/create/${productId}`)
      router.push("/auth")
    }
  }

  const filteredReviews = filter.score !== null
    ? reviews.filter(r => r.rating === filter.score)
    : reviews

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (sortBy === 'recent') return bDate - aDate
    const aScore = a.rating || 0
    const bScore = b.rating || 0
    if (sortBy === 'low') return aScore !== bScore ? aScore - bScore : bDate - aDate
    if (sortBy === 'high') return aScore !== bScore ? bScore - aScore : bDate - aDate
    return 0
  })

  return (
    <div className="w-full max-w-xl flex flex-col items-start mb-2">
      <ContentBox 
        variant="secondary" 
        noMargin
        className="mb-2"
      >
        <div className="flex items-center justify-between w-full mb-2">
          <h2 
            className="text-xl font-semibold"
            style={{ color: colours.text.primary }}
          >
            Reviews
          </h2>
          <button
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200"
            style={{ 
              backgroundColor: '#f1f5f9', // slate-100
              boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)"
            }}
            aria-label="Write a Review"
          >
           <Plus/>
          </button>
        </div>
        {/* Sort by buttons */}
        <div className="flex items-center mt-2 mb-2">
            <button
              onClick={() => {
                setSortBy('recent')
                setRefreshing(true)
                setTimeout(() => setRefreshing(false), 350)
              }}
              className={`flex items-center justify-center gap-2 flex-1 py-2 pl-4 pr-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200 ${
                sortBy === 'recent' ? 'ring-1 ring-zinc-200' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'recent' ? '#e2e8f0' : '#f1f5f9', // slate-200 vs slate-100
                boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <Clock size={18} style={{ color: '#1f2937' }} />
              <span className="font-medium" style={{ color: '#1f2937' }}>Recent</span>
            </button>
            <div className="w-3"></div>
            <button
              onClick={() => {
                setSortBy('low')
                setRefreshing(true)
                setTimeout(() => setRefreshing(false), 350)
              }}
              className={`flex items-center justify-center gap-2 flex-1 py-2 px-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200 ${
                sortBy === 'low' ? 'ring-1 ring-zinc-200' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'low' ? '#e2e8f0' : '#f1f5f9', // slate-200 vs slate-100
                boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <TrendingDown size={18} style={{ color: '#1f2937' }} />
              <span className="font-medium" style={{ color: '#1f2937' }}>Low</span>
            </button>
            <div className="w-3"></div>
            <button
              onClick={() => {
                setSortBy('high')
                setRefreshing(true)
                setTimeout(() => setRefreshing(false), 350)
              }}
              className={`flex items-center justify-center gap-2 flex-1 py-2 pl-2 pr-4 rounded-xl shadow-xl border-2 border-black transition-all duration-200 ${
                sortBy === 'high' ? 'ring-1 ring-zinc-200' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'high' ? '#e2e8f0' : '#f1f5f9', // slate-200 vs slate-100
                boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <TrendingUp size={18} style={{ color: '#1f2937' }} />
              <span className="font-medium" style={{ color: '#1f2937' }}>High</span>
            </button>
        </div>
        {sortedReviews.length === 0 ? (
          <div style={{ color: colours.text.secondary }}>
            No reviews{filter.score ? ` with ${filter.score} star${filter.score > 1 ? 's' : ''}` : ''}.
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {refreshing ? (
                // Show skeleton loading cards
                Array.from({ length: Math.min(3, visibleReviews) }).map((_, idx) => (
                  <li key={`skeleton-${idx}`}>
                    <div 
                      className="block rounded-xl shadow border-2 border-black shadow-xl p-4 animate-pulse"
                      style={{ 
                        backgroundColor: '#f1f5f9',
                        borderColor: colours.content.border
                      }}
                    >
                      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="flex flex-row items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-6 h-6 bg-gray-300 rounded"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </li>
                ))
              ) : (
                sortedReviews.slice(0, visibleReviews).map((review, idx) => {
                  let opacity = 1
                  if (!seeMoreClicked && visibleReviews === 3 && !filter.score) {
                    opacity = 1 - idx * 0.3
                  }
                  return (
                    <li key={review.id} style={{ opacity }}>
                      <Link 
                        href={`/review/${review.id}`} 
                        className="block rounded-xl shadow border-2 border-black shadow-xl p-4 transition cursor-pointe bg-slate-100r"
                        style={{ 
                          backgroundColor: '#f1f5f9',
                          borderColor: colours.content.border
                        }}
                      >
                        <div 
                          className="font-bold mb-1"
                          style={{ color: colours.text.primary }}
                        >
                          {review.isAnonymous ? "anon" : (usernames[review.userId] || "User")}
                        </div>
                        <div className="flex flex-row items-center gap-4 mb-1">
                          <span className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xl ${review.rating >= star ? `border-${colours.status.warning.background}` : 'opacity-30'}`}
                                role="img"
                                aria-label="star"
                              >
                               <StarIcon size={24} filled={review.rating >= star} />
                              </span>
                            ))}
                          </span>
                        </div>
                        <div 
                          className="truncate"
                          style={{ color: colours.text.primary }}
                        >
                          {review.reviewText || "(No review text)"}
                        </div>
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>
            
            {visibleReviews < sortedReviews.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => { setVisibleReviews(sortedReviews.length); setSeeMoreClicked(true) }}
                  className="px-4 py-2 rounded-xl shadow border-2 border-black transition-all duration-200 font-medium"
                  style={{ 
                    backgroundColor: '#f1f5f9', // slate-100
                    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
                    color: '#1f2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e2e8f0' // slate-200
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9' // slate-100
                  }}
                >
                  See more
                </button>
              </div>
            )}
            {filter.score && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => setFilter({ score: null })}
                  className="px-3 py-1 rounded font-semibold transition"
                  style={{ 
                    backgroundColor: colours.button.ghost.background,
                    color: colours.button.ghost.text
                  }}
                >
                  Clear filter
                </button>
              </div>
            )}
          </>
        )}
      </ContentBox>
    </div>
  )
}

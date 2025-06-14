"use client"

import { Review } from "@/types/review"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { colours } from "@/styles/colours"
import { UserProfile } from "@/types/user"
import StarIcon, { Plus } from "./Icons"

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
  sortBy: 'recent' | 'critical' | 'favourable'
  setSortBy: (sortBy: 'recent' | 'critical' | 'favourable') => void
  sortOpen: boolean
  setSortOpen: (open: boolean) => void
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
  sortOpen,
  setSortOpen,
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
    if (sortBy === 'critical') return aScore !== bScore ? aScore - bScore : bDate - aDate
    if (sortBy === 'favourable') return aScore !== bScore ? bScore - aScore : bDate - aDate
    return 0
  })

  return (
    <div className="w-full">
      <div 
        className={`w-full border rounded-xl p-4 transition-all duration-300 ${refreshing ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-0'}`}
        style={{ 
          backgroundColor: colours.content.surfaceSecondary,
          borderColor: colours.content.border
        }}
      >
        <div className="flex items-center justify-between w-full mb-2">
          <h2 
            className="text-xl font-semibold"
            style={{ color: colours.text.primary }}
          >
            Reviews
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="inline-flex items-center font-semibold px-3 h-10 rounded-lg transition text-sm"
                style={{ 
                  backgroundColor: colours.button.secondary.background,
                  border: `1px solid ${colours.button.secondary.border}`,
                  color: colours.button.secondary.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colours.button.secondary.background
                }}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                Sort by
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sortOpen && (
                <ul 
                  className="absolute right-0 mt-1 w-44 border rounded-lg shadow-lg z-20" 
                  style={{ 
                    backgroundColor: colours.content.surface,
                    borderColor: colours.content.border
                  }}
                  role="listbox"
                >
                  {['recent', 'critical', 'favourable'].map(option => (
                    <li key={option}>
                      <button
                        className={`w-full text-left px-4 py-2 transition-all duration-200 rounded ${sortBy === option ? 'shadow ring-2 scale-[1.04]' : ''}`}
                        style={{
                          backgroundColor: sortBy === option ? colours.interactive.disabled.background : 'transparent',
                          color: sortBy === option ? colours.interactive.selected.text : colours.text.primary,
                          ...(sortBy === option && { 
                            borderColor: colours.button.primary.background,
                            ringColor: colours.button.primary.background
                          })
                        }}
                        onMouseEnter={(e) => {
                          if (sortBy !== option) {
                            e.currentTarget.style.backgroundColor = colours.interactive.hover.background
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (sortBy !== option) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                        onClick={() => { 
                          setSortBy(option as typeof sortBy)
                          setSortOpen(false)
                          setRefreshing(true)
                          setTimeout(() => setRefreshing(false), 350)
                        }}
                        role="option"
                        aria-selected={sortBy === option}
                      >
                        {option === 'recent' ? 'Most Recent' : option === 'critical' ? 'Most Critical' : 'Most Favourable'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleWriteReview}
              className="inline-flex items-center justify-center font-bold text-xl px-4 h-10 rounded-lg transition ml-2 mb-0"
              style={{ 
                backgroundColor: colours.button.secondary.background,
                border: `1px solid ${colours.button.secondary.border}`,
                color: colours.button.secondary.text
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colours.button.secondary.background
              }}
              aria-label="Write a Review"
            >
             <Plus/>
            </button>
          </div>
        </div>
        {sortedReviews.length === 0 ? (
          <div style={{ color: colours.text.secondary }}>
            No reviews{filter.score ? ` with ${filter.score} star${filter.score > 1 ? 's' : ''}` : ''}.
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {sortedReviews.slice(0, visibleReviews).map((review, idx) => {
                let opacity = 1
                if (!seeMoreClicked && visibleReviews === 3 && !filter.score) {
                  opacity = 1 - idx * 0.3
                }
                return (
                  <li key={review.id} style={{ opacity }}>
                    <Link 
                      href={`/review/${review.id}`} 
                      className="block rounded-lg border shadow-sm p-4 transition cursor-pointer"
                      style={{ 
                        backgroundColor: colours.content.surface,
                        borderColor: colours.content.border
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colours.interactive.hover.background
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colours.content.surface
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
                             <StarIcon size={24} />
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
              })}
            </ul>
            {visibleReviews < sortedReviews.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => { setVisibleReviews(sortedReviews.length); setSeeMoreClicked(true) }}
                  className="px-4 py-2 rounded font-semibold transition"
                  style={{ 
                    backgroundColor: colours.button.secondary.background,
                    border: `1px solid ${colours.button.secondary.border}`,
                    color: colours.button.secondary.text
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colours.button.secondary.hover.background
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colours.button.secondary.background
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colours.button.ghost.hover.background
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colours.button.ghost.background
                  }}
                >
                  Clear filter
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

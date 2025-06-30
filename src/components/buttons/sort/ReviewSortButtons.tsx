"use client"

import { Clock, TrendingUp, TrendingDown } from "lucide-react"

interface ReviewSortButtonsProps {
  sortBy: 'recent' | 'low' | 'high'
  setSortBy: (sortBy: 'recent' | 'low' | 'high') => void
  setRefreshing: (refreshing: boolean) => void
}

export default function ReviewSortButtons({ 
  sortBy, 
  setSortBy, 
  setRefreshing 
}: ReviewSortButtonsProps) {
  const handleSortChange = (newSort: 'recent' | 'low' | 'high') => {
    setSortBy(newSort)
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 350)
  }

  const getButtonStyle = (buttonSort: 'recent' | 'low' | 'high') => ({
    backgroundColor: sortBy === buttonSort ? '#e2e8f0' : '#f1f5f9', /* slate-200 vs slate-100 */
    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
  })

  const getButtonClassName = (buttonSort: 'recent' | 'low' | 'high') => 
    `flex items-center justify-center gap-2 flex-1 py-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200 ${
      sortBy === buttonSort ? 'ring-1 ring-zinc-200' : ''
    }`

  return (
    <div className="flex items-center mt-2 mb-2">
      <button
        onClick={() => handleSortChange('recent')}
        className={`${getButtonClassName('recent')} pl-4 pr-2`}
        style={getButtonStyle('recent')}
      >
        <Clock size={18} style={{ color: '#1f2937' }} />
        <span className="font-medium" style={{ color: '#1f2937' }}>Recent</span>
      </button>
      <div className="w-3"></div>
      <button
        onClick={() => handleSortChange('low')}
        className={`${getButtonClassName('low')} px-2`}
        style={getButtonStyle('low')}
      >
        <TrendingDown size={18} style={{ color: '#1f2937' }} />
        <span className="font-medium" style={{ color: '#1f2937' }}>Low</span>
      </button>
      <div className="w-3"></div>
      <button
        onClick={() => handleSortChange('high')}
        className={`${getButtonClassName('high')} pl-2 pr-4`}
        style={getButtonStyle('high')}
      >
        <TrendingUp size={18} style={{ color: '#1f2937' }} />
        <span className="font-medium" style={{ color: '#1f2937' }}>High</span>
      </button>
    </div>
  )
}

"use client"

import RecentSortButton from "./RecentSortButton"
import LowToHighSortButton from "./LowToHighSortButton"
import HighToLowSortButton from "./HighToLowSortButton"

interface SortButtonGroupProps {
  sortBy: 'recent' | 'low' | 'high'
  setSortBy: (sortBy: 'recent' | 'low' | 'high') => void
  setRefreshing?: (refreshing: boolean) => void
  recentLabel?: string
  lowLabel?: string
  highLabel?: string
  refreshDelay?: number
}

export default function SortButtonGroup({ 
  sortBy, 
  setSortBy, 
  setRefreshing,
  recentLabel = "Recent",
  lowLabel = "Low",
  highLabel = "High",
  refreshDelay = 350
}: SortButtonGroupProps) {
  const handleSortChange = (newSort: 'recent' | 'low' | 'high') => {
    setSortBy(newSort)
    if (setRefreshing) {
      setRefreshing(true)
      setTimeout(() => setRefreshing(false), refreshDelay)
    }
  }

  return (
    <div className="flex items-center mt-2 mb-2">
      <RecentSortButton
        isActive={sortBy === 'recent'}
        onClick={() => handleSortChange('recent')}
        label={recentLabel}
        size="normal"
      />
      <div className="w-3"></div>
      <LowToHighSortButton
        isActive={sortBy === 'low'}
        onClick={() => handleSortChange('low')}
        label={lowLabel}
        size="normal"
      />
      <div className="w-3"></div>
      <HighToLowSortButton
        isActive={sortBy === 'high'}
        onClick={() => handleSortChange('high')}
        label={highLabel}
        size="normal"
      />
    </div>
  )
}

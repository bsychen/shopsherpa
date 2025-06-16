"use client"

import RecentSortButton from "./RecentSortButton"
import PopularSortButton from "./PopularSortButton"

interface TagSortButtonGroupProps {
  sortBy: 'recent' | 'popular'
  onSortChange: (sort: 'recent' | 'popular') => void
}

export default function TagSortButtonGroup({ 
  sortBy, 
  onSortChange 
}: TagSortButtonGroupProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <RecentSortButton
        isActive={sortBy === 'recent'}
        onClick={() => onSortChange('recent')}
        className=""
      />
      <PopularSortButton
        isActive={sortBy === 'popular'}
        onClick={() => onSortChange('popular')}
      />
    </div>
  )
}

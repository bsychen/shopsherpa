"use client"

import { TrendingDown } from "lucide-react"
import SortButton from "./SortButton"

interface LowToHighSortButtonProps {
  isActive: boolean
  onClick: () => void
  label?: string
}

export default function LowToHighSortButton({ 
  isActive, 
  onClick, 
  label = "Low" 
}: LowToHighSortButtonProps) {
  return (
    <SortButton
      isActive={isActive}
      onClick={onClick}
      icon={<TrendingDown size={18} style={{ color: '#1f2937' }} />}
      label={label}
      className="px-2"
    />
  )
}

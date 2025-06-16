"use client"

import { TrendingUp } from "lucide-react"
import SortButton from "./SortButton"

interface HighToLowSortButtonProps {
  isActive: boolean
  onClick: () => void
  label?: string
}

export default function HighToLowSortButton({ 
  isActive, 
  onClick, 
  label = "High" 
}: HighToLowSortButtonProps) {
  return (
    <SortButton
      isActive={isActive}
      onClick={onClick}
      icon={<TrendingUp size={18} style={{ color: '#1f2937' }} />}
      label={label}
      className="pl-2 pr-4"
    />
  )
}

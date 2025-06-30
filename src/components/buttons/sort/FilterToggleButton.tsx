"use client"

import { Filter } from "lucide-react"

interface FilterToggleButtonProps {
  isActive: boolean
  selectedCount: number
  onClick: () => void
  size?: 'compact' | 'normal'
}

export default function FilterToggleButton({ 
  isActive, 
  selectedCount, 
  onClick,
  size = 'compact'
}: FilterToggleButtonProps) {
  const hasSelections = selectedCount > 0
  const sizeClasses = size === 'normal' 
    ? "gap-2 py-2 px-4" 
    : "gap-1 py-1 px-2 sm:py-1.5 sm:px-3"
    
  const baseClassName = `flex items-center ${sizeClasses} rounded-lg shadow-xl border-2 border-black transition-all duration-200`
  const activeRing = isActive || hasSelections ? "ring-1 ring-zinc-200" : ""
  const fullClassName = `${baseClassName} ${activeRing}`.trim()

  const buttonStyle = {
    backgroundColor: isActive || hasSelections ? '#e2e8f0' : '#f1f5f9', /* slate-200 vs slate-100 */
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  }

  const iconSize = size === 'normal' ? 18 : 14
  const textSize = size === 'normal' ? "text-base font-medium" : "text-xs sm:text-sm font-medium"

  return (
    <button
      onClick={onClick}
      className={fullClassName}
      style={buttonStyle}
    >
      <Filter size={iconSize} className="sm:w-4 sm:h-4" style={{ color: '#1f2937' }} />
      <span className={textSize} style={{ color: '#1f2937' }}>
        Filter {hasSelections && `(${selectedCount})`}
      </span>
    </button>
  )
}

"use client"

import { Clock } from "lucide-react"

interface RecentSortButtonProps {
  isActive: boolean
  onClick: () => void
  label?: string
  className?: string
}

export default function RecentSortButton({ 
  isActive, 
  onClick,
  label = "Recent",
  className = "pl-4 pr-2"
}: RecentSortButtonProps) {
  const baseClassName = "flex items-center justify-center gap-1 py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg shadow border-2 border-black transition-all duration-200"
  const activeRing = isActive ? "ring-1 ring-zinc-200" : ""
  const fullClassName = `${baseClassName} ${activeRing} ${className}`.trim()

  const buttonStyle = {
    backgroundColor: isActive ? '#e2e8f0' : '#f1f5f9', // slate-200 vs slate-100
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  }

  return (
    <button
      onClick={onClick}
      className={fullClassName}
      style={buttonStyle}
    >
      <Clock size={14} className="sm:w-4 sm:h-4" style={{ color: '#1f2937' }} />
      <span className="font-medium text-xs sm:text-sm" style={{ color: '#1f2937' }}>
        {label}
      </span>
    </button>
  )
}

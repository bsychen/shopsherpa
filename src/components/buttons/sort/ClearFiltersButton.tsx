"use client"

import { X } from "lucide-react"

interface ClearFiltersButtonProps {
  onClick: () => void
  hasActiveFilters: boolean
}

export default function ClearFiltersButton({ 
  onClick, 
  hasActiveFilters 
}: ClearFiltersButtonProps) {
  if (!hasActiveFilters) {
    return null
  }

  const buttonStyle = {
    backgroundColor: '#fef2f2', // red-50
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 py-1.5 px-3 rounded-lg shadow border-2 border-red-300 transition-all duration-200 hover:bg-red-100"
      style={buttonStyle}
    >
      <X size={16} style={{ color: '#dc2626' }} />
      <span className="font-medium text-sm" style={{ color: '#dc2626' }}>
        Clear
      </span>
    </button>
  )
}

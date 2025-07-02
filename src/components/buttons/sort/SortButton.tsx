"use client"

import { ReactNode } from "react"

interface SortButtonProps {
  isActive: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  className?: string
}

export default function SortButton({ 
  isActive, 
  onClick, 
  icon, 
  label, 
  className = "" 
}: SortButtonProps) {
  const baseClassName = "flex items-center justify-center gap-2 flex-1 py-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200"
  const activeRing = isActive ? "ring-1 ring-zinc-200" : ""
  const fullClassName = `${baseClassName} ${activeRing} ${className}`.trim()

  const buttonStyle = {
    backgroundColor: isActive ? '#e2e8f0' : '#f1f5f9', /* slate-200 vs slate-100 */
    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
  }

  return (
    <button
      onClick={onClick}
      className={fullClassName}
      style={buttonStyle}
    >
      {icon}
      <span className="font-medium" style={{ color: '#1f2937' }}>
        {label}
      </span>
    </button>
  )
}

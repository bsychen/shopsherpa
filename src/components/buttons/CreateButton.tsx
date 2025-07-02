"use client"

import { useRouter } from "next/navigation"
import { UserProfile } from "@/types/user"

interface CreateButtonProps {
  user: UserProfile | null
  createPath?: string
  onClick?: (e: React.MouseEvent) => void
  label?: string
  showLabelOnMobile?: boolean
  className?: string
  ariaLabel?: string
}

export default function CreateButton({ 
  user, 
  createPath,
  onClick,
  label = "Create",
  showLabelOnMobile = true,
  className = "shadow-xl",
  ariaLabel 
}: CreateButtonProps) {
  const router = useRouter()

  const handleCreate = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick(e)
      return
    }
    
    if (!createPath) return
    
    if (user) {
      router.push(createPath)
    } else {
      localStorage.setItem("postAuthRedirect", createPath)
      router.push("/auth")
    }
  }

  const baseClassName = "flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-xl border-2 border-black transition-all duration-200 hover:scale-[1.02]"
  const fullClassName = `${baseClassName} ${className}`.trim()

  const buttonStyle = {
    backgroundColor: '#f1f5f9', /* slate-100 */
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  }

  return (
    <button
      onClick={handleCreate}
      className={fullClassName}
      style={buttonStyle}
      aria-label={ariaLabel || `Create ${label}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth="2" 
        stroke="currentColor" 
        className="w-4 h-4 sm:w-5 sm:h-5"
        style={{ color: '#1f2937' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {label && (
        <span 
          className={`font-medium text-sm sm:text-base ${showLabelOnMobile ? '' : 'hidden sm:inline'}`}
          style={{ color: '#1f2937' }}
        >
          {label}
        </span>
      )}
    </button>
  )
}

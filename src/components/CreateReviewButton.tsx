"use client"

import { useRouter } from "next/navigation"
import { UserProfile } from "@/types/user"
import { Plus } from "./Icons"

interface CreateReviewButtonProps {
  user: UserProfile | null
  productId: string
}

export default function CreateReviewButton({ user, productId }: CreateReviewButtonProps) {
  const router = useRouter()

  const handleWriteReview = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      router.push(`/review/create/${productId}`)
    } else {
      localStorage.setItem("postAuthRedirect", `/review/create/${productId}`)
      router.push("/auth")
    }
  }

  return (
    <button
      onClick={handleWriteReview}
      className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl border-2 border-black transition-all duration-200"
      style={{ 
        backgroundColor: '#f1f5f9', // slate-100
        boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)"
      }}
      aria-label="Write a Review"
    >
      <Plus />
    </button>
  )
}

"use client"

import { UserProfile } from "@/types/user"
import CreateButton from "./CreateButton"

interface CreateReviewButtonProps {
  user: UserProfile | null
  productId: string
}

export default function CreateReviewButton({ user, productId }: CreateReviewButtonProps) {
  return (
    <CreateButton
      user={user}
      createPath={`/review/create/${productId}`}
      label="Create"
      ariaLabel="Write a Review"
      showLabelOnMobile={true}
    />
  )
}

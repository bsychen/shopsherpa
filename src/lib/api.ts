import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { ReviewSummary } from "@/types/reviewSummary";
import { UserProfile } from "firebase/auth";

export async function searchProducts(query: string) {
  const res = await fetch(`/api/products/search?name=${encodeURIComponent(query)}`);
  return await res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) return null;
  return await res.json();
} 

export async function getProductReviews(productId: string): Promise<Review[] | null>  {
  const res = await fetch(`/api/reviews/productId/${encodeURIComponent(productId)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getUserReviews(userId: string): Promise<Review[] | null> {
  const res = await fetch(`/api/reviews/userId/${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getReview(id: string): Promise<Review | null> {
  const res = await fetch(`/api/reviews/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function createReview(productId: string, userId: string, reviewText: string, valueRating: number, qualityRating: number) {
  const params = new URLSearchParams({
    userId,
    reviewText,
    valueRating: valueRating.toString(),
    qualityRating: qualityRating.toString()
  });
  const res = await fetch(`/api/reviews/create/${encodeURIComponent(productId)}?${params.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to create review');
  return await res.json();
}

export async function createUserInFirestore(uid: string, email: string, username: string) {
  const res = await fetch('/api/auth/createUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, email, username }),
  });
  if (!res.ok) throw new Error('Failed to create user in Firestore');
  return await res.json();
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const res = await fetch(`/api/auth/getUser/${encodeURIComponent(userId)}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function updateReview(
  id: string,
  valueRating?: number,
  qualityRating?: number,
  reviewText?: string
): Promise<{ success: boolean; error?: string }> {
  const params = new URLSearchParams();
  if (typeof valueRating === 'number') params.append('valueRating', valueRating.toString());
  if (typeof qualityRating === 'number') params.append('qualityRating', qualityRating.toString());
  if (typeof reviewText === 'string') params.append('reviewText', reviewText);
  const res = await fetch(`/api/reviews/update/${encodeURIComponent(id)}?${params.toString()}`, {
    method: 'PATCH',
  });
  return await res.json();
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/reviews/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return await res.json();
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary | null> {
  const res = await fetch(`/api/reviews/info/${encodeURIComponent(productId)}`);
  if (!res.ok) return null;
  return await res.json();
}

import { Product } from "@/types/product";
import { Review } from "@/types/reviews";

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

export async function createReview(ProductId: string, UserId: string, ReviewText: string, Rating: number) {
  const params = new URLSearchParams({ UserId, ReviewText, Rating: Rating.toString() });
  const res = await fetch(`/api/reviews/create/${encodeURIComponent(ProductId)}?${params.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to create review');
  return await res.json();
}

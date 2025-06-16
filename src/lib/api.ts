import { Brand } from "@/types/brand";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { ReviewSummary } from "@/types/reviewSummary";
import { UserProfile } from "firebase/auth";

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

function getCacheKey(url: string): string {
  return url;
}

function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

async function fetchWithCache(url: string, options?: RequestInit) {
  const cacheKey = getCacheKey(url);
  const cached = cache.get(cacheKey);
  
  if (cached && isValidCache(cached.timestamp)) {
    return { json: () => Promise.resolve(cached.data), ok: cached.ok };
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Only cache successful responses
  if (response.ok) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ok: response.ok
    });
  }
  
  return { json: () => Promise.resolve(data), ok: response.ok };
}

export async function searchProducts(query: string) {
  const res = await fetchWithCache(`/api/products/search?name=${encodeURIComponent(query)}`);
  return await res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetchWithCache(`/api/products/${id}`);
  if (!res.ok) return null;
  return await res.json();
} 

export async function getProductReviews(productId: string): Promise<Review[] | null>  {
  const res = await fetchWithCache(`/api/reviews/productId/${encodeURIComponent(productId)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getUserReviews(userId: string): Promise<Review[] | null> {
  const res = await fetchWithCache(`/api/reviews/userId/${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getReview(id: string): Promise<Review | null> {
  const res = await fetchWithCache(`/api/reviews/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function createReview(productId: string, userId: string, reviewText: string, rating: number, isAnonymous: boolean = false) {
  const params = new URLSearchParams({
    userId,
    reviewText,
    rating: rating.toString(),
    isAnonymous: isAnonymous.toString()
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
  rating?: number,
  reviewText?: string
): Promise<{ success: boolean; error?: string }> {
  const params = new URLSearchParams();
  if (typeof rating === 'number') params.append('rating', rating.toString());
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

export async function getBrands(): Promise<{ id: string; name: string }[]> {
  const res = await fetch('/api/brands');
  if (!res.ok) return [];
  return await res.json();
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const res = await fetch(`/api/brands/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getBrandByName(name: string): Promise<{ brandId: string } | null> {
  const res = await fetch(`/api/brands/name?name=${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getProductsWithGenericName(genericName: string): Promise<Product[]> {
  const res = await fetch(`/api/products/genericName?name=${encodeURIComponent(genericName)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const res = await fetch(`/api/products/brand/${encodeURIComponent(brandId)}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function getSimilarProductsByCategories(categoriesTags: string[], currentProductId: string): Promise<Product[]> {
  const tagsParam = categoriesTags.join(',');
  const res = await fetch(`/api/products/similar?tags=${encodeURIComponent(tagsParam)}&currentId=${encodeURIComponent(currentProductId)}`);
  if (!res.ok) return [];
  return await res.json();
}

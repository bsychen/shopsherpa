import { Product } from "@/types/product";

export async function searchProducts(query: string) {
    const res = await fetch(`/api/products/search?name=${encodeURIComponent(query)}`);
    return await res.json();
  }

  export async function getProduct(id: string): Promise<Product | null> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    return await res.json();
  }
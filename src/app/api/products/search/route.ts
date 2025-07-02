import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { ProductSearchResult } from "@/types/product";
import Fuse from "fuse.js";

const FUZZY_THRESHOLD = 0.3;
const CACHE_DURATION = 300; /* 5 minutes */
const SEARCH_LIMIT = 500; /* Increased for better search quality */

/* In-memory cache for products */
let productsCache: {
  data: ProductSearchResult[];
  timestamp: number;
} | null = null;

async function getCachedProducts(): Promise<ProductSearchResult[]> {
  const now = Date.now();
  
  /* Return cached data if still valid */
  if (productsCache && (now - productsCache.timestamp) < CACHE_DURATION * 1000) {
    return productsCache.data;
  }
  
  /* Fetch fresh data */
  const productsSnapshot = await db
    .collection("products")
    .select("productName", "brandName", "imageUrl") /* Only fetch needed fields */
    .limit(SEARCH_LIMIT)
    .get();

  const products: ProductSearchResult[] = [];
  productsSnapshot.forEach(doc => {
    const data = doc.data();
    products.push({
      id: doc.id,
      productName: data.productName || 'Unknown Product',
      brandName: data.brandName || null,
      imageUrl: data.imageUrl || null,
    });
  });

  /* Update cache */
  productsCache = {
    data: products,
    timestamp: now,
  };

  return products;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('name') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    /* Get cached products */
    const products = await getCachedProducts();

    /* Use Fuse.js for fuzzy search */
    const fuse = new Fuse(products, {
      keys: ['productName', 'brandName'],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    });

    const searchResults = fuse.search(query);
    const results = searchResults.map(result => result.item);
    
    /* Apply limit */
    const limitedResults = results.slice(0, limit);
    
    /* Add cache headers */
    const response = NextResponse.json(limitedResults);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
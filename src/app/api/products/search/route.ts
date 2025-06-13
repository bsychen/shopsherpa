import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { ProductSearchResult } from "@/types/product";
import Fuse from "fuse.js";

const FUZZY_THRESHOLD = 0.3;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('name') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Get more products for better search results
    const productsSnapshot = await db
      .collection("products")
      .limit(100) // Get more products for better search
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

    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(products, {
      keys: ['productName', 'brandName'],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    });

    const searchResults = fuse.search(query);
    const results = searchResults.map(result => result.item);
    
    // Apply limit
    const limitedResults = results.slice(0, limit);
    
    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
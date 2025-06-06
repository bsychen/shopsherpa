import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { ProductSearchResult } from "@/types/product";
import Fuse from "fuse.js";

const FUZZY_THRESHOLD = 0.3;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    const productsSnapshot = await db
      .collection("products")
      .get();

    const products: ProductSearchResult[] = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        productName: doc.data().productName,
        brandName: doc.data().brandName || null,
        imageUrl: doc.data().imageUrl || null,
      });
    });

    const fuse = new Fuse(products, {
      keys: ['productName'],
      threshold: FUZZY_THRESHOLD, 
    });

    const results = fuse.search(name || '').map(result => result.item);
    
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
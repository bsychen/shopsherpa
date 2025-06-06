import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";
import Fuse from "fuse.js";

const FUZZY_THRESHOLD = 0.3;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    const productsSnapshot = await db
      .collection("products")
      .get();

    const products: Product[] = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        name: doc.data().ProductName,
        dbPrice: doc.data().ExpectedPrice,
      });
    });

    const fuse = new Fuse(products, {
      keys: ['name'],
      threshold: FUZZY_THRESHOLD, 
    });

    const results = fuse.search(name || '').map(result => result.item);
    
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
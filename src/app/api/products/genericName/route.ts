import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genericName = searchParams.get('name');

    if (!genericName) {
      return NextResponse.json({ error: "Generic name parameter is required" }, { status: 400 });
    }

    // Convert to lowercase for case-insensitive comparison
    const lowerGenericName = genericName.toLowerCase();

    const productsSnapshot = await db
      .collection("products")
      .where("genericNameLower", "==", lowerGenericName)
      .get();

    const products: Product[] = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products by generic name:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
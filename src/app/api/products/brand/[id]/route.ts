import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const productsSnapshot = await db
      .collection("products")
      .where("brandId", "==", id)
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
    console.error("Error fetching products by brand:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

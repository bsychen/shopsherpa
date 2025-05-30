import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

async function fetchProductData(id: string) {
  const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${id}?fields=product_name`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.product || !data.product.product_name) return null;
  return {
    ProductName: data.product.product_name,
    ProductNameLower: data.product.product_name.toLowerCase(),
    ExpectedPrice: 0,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const doc = await db.collection("products").doc(id).get();
    if (doc.exists) {
      return NextResponse.json({
        id: doc.id,
        name: doc.data().ProductName,
        dbPrice: doc.data().ExpectedPrice,
      });
    }

    const productData = await fetchProductData(id);
    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add to Firestore
    await db.collection("products").doc(id).set(productData);
    return NextResponse.json({
      id,
      name: productData.ProductName,
      dbPrice: productData.ExpectedPrice,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
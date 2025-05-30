import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      name: doc.data().ProductName,
      dbPrice: doc.data().ExpectedPrice,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
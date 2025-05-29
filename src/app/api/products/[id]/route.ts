import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await db.collection("products").doc(params.id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: doc.id,
      name: doc.data().ProductName,
      dbPrice: doc.data().ExpectedPrice,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
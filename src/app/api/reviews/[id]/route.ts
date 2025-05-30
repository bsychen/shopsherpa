import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from '@/types/reviews';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await db.collection("reviews").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: doc.id,
      productId: doc.data().ProductId,
      userId: doc.data().UserId,
      reviewText: doc.data().ReviewText,
    }) as NextResponse<Review>;
    
  } catch {
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}
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
      createdAt: doc.data().createdAt,
      productId: doc.data().croductId,
      reviewText: doc.data().reviewText,
      valueRating: doc.data().valueRating,
      qualityRating: doc.data().qualityRating,
      userId: doc.data().userId,
      username: doc.data().username,
    }) as NextResponse<Review>;

  } catch {
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from "@/types/reviews";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("UserId", "==", userId)
      .get();

    const reviews: Review[] = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({
        Id: doc.id,
        CreatedAt: doc.data().CreatedAt,
        ProductId: doc.data().ProductId,
        ReviewText: doc.data().ReviewText,
        Rating: doc.data().Rating,
        UserId: doc.data().UserId,
      });
    });
    
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" }, 
      { status: 500 });
  }
}
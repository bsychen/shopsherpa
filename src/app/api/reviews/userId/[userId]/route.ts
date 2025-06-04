import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from "@/types/review";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .get();

    const reviews: Review[] = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        createdAt: doc.data().createdAt,
        productId: doc.data().productId,
        reviewText: doc.data().reviewText,
        valueRating: doc.data().valueRating,
        qualityRating: doc.data().qualityRating,
        userId: doc.data().userId,
        username: doc.data().username,
      });
    });
    
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" }, 
      { status: 500 });
  }
}
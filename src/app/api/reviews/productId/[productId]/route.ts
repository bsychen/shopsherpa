import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from "@/types/review";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("productId", "==", productId.trim())
      .get();

    const reviews: Review[] = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        createdAt: doc.data().createdAt,
        productId: doc.data().productId,
        reviewText: doc.data().reviewText,
        rating: doc.data().rating,
        userId: doc.data().userId,
        isAnonymous: doc.data().isAnonymous || false,
      });
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
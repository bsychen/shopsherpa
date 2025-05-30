import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params; // No need for Promise here
  try {
    // Correct way to create a reference
    const productRef = db.doc(`products/${productId}`);
    
    // Query reviews where ProductId matches the reference
    const reviewsSnapshot = await db.collection("reviews")
      .where("ProductId", "==", productRef)
      .get();
    
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
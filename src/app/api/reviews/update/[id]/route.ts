import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { Review } from '@/types/review';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const reviewText = searchParams.get('reviewText') || undefined;
    const rating = parseInt(searchParams.get('rating'));

    // Defensive: Only update provided fields
    const updateData: Partial<Review> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (typeof reviewText === 'string') updateData.reviewText = reviewText;
    if (!isNaN(rating)) updateData.rating = rating;

    await db.collection('reviews').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

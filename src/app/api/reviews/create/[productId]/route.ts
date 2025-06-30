import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from '@/types/review';

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params;
        const { searchParams } = new URL(req.url);

        const userId = searchParams.get('userId');
        const reviewText = searchParams.get('reviewText') || undefined;
        const rating = parseInt(searchParams.get('rating'));
        const isAnonymous = searchParams.get('isAnonymous') === 'true';
        
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing UserId' }, { status: 400 });
        }
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const review: Omit<Review, 'id'> & { createdAt: Date, productId: string } = {
            createdAt: new Date(),
            productId: productId,
            reviewText: reviewText,
            rating: rating,
            userId: userId,
            isAnonymous: isAnonymous,
        };

        /* Create review document */
        const docRef = await db.collection('reviews').add(review);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
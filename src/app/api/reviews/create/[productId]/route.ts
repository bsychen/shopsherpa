import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from '@/types/review';

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params;
        const { searchParams } = new URL(req.url);

        const userId = searchParams.get('userId');
        const reviewText = searchParams.get('reviewText') || undefined;
        const valueRating = parseInt(searchParams.get('valueRating'));
        const qualityRating = parseInt(searchParams.get('qualityRating'));
        
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing UserId' }, { status: 400 });
        }
        const review: Omit<Review, 'id'> & { createdAt: Date, productId: string } = {
            createdAt: new Date(),
            productId: productId,
            reviewText: reviewText,
            valueRating: valueRating,
            qualityRating: qualityRating,
            userId: userId,
        };

        // Create review document
        const docRef = await db.collection('reviews').add(review);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
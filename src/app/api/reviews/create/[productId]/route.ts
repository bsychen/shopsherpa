import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Review } from '@/types/reviews';

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params;
        const { searchParams } = new URL(req.url);

        const userId = searchParams.get('UserId');
        const username = searchParams.get('Username');
        const reviewText = searchParams.get('ReviewText') || undefined;
        const rating = parseInt(searchParams.get('Rating'));
        
        if (!userId || !username) {
            return NextResponse.json({ success: false, error: 'Missing UserId or Username' }, { status: 400 });
        }
        const review: Omit<Review, 'id'> & { createdAt: Date, productId: string } = {
            createdAt: new Date(),
            productId: productId,
            reviewText: reviewText,
            rating: rating,
            userId: userId,
            username: username,
        };

        // Create review document
        const docRef = await db.collection('reviews').add(review);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
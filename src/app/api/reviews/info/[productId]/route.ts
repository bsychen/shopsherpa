import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import type { ReviewSummary } from '@/types/reviewSummary';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    const { productId } = await params;

    if (!productId) {
        return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    try {
        const reviewsSnapshot = await db
            .collection('reviews')
            .where('productId', '==', productId)
            .get();
        const reviews = reviewsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                rating: data.rating,
                reviewText: data.reviewText,
                createdAt: data.createdAt,
            };
        });
        const reviewCount = reviews.length;
        const avgRating =
            reviewCount === 0
                ? 0
                : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount;

        const ratingDistribution = reviews.reduce((acc, r) => {
            if (typeof r.rating === 'number' && acc[r.rating] !== undefined) {
                acc[r.rating]++;
            }
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>);

        return NextResponse.json({
            productId,
            averageRating: avgRating,
            ratingDistribution,
            totalReviews: reviewCount,
        }) as NextResponse<ReviewSummary>;
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

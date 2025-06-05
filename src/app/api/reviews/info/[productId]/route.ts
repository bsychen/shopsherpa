import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import type { ReviewSummary } from '@/types/reviewSummary';

export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    const { productId } = params;

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
                valueRating: data.valueRating,
                qualityRating: data.qualityRating,
                reviewText: data.reviewText,
                createdAt: data.createdAt,
            };
        });
        const reviewCount = reviews.length;
        const avgValueRating =
            reviewCount === 0
                ? 0
                : reviews.reduce((sum, r) => sum + (r.valueRating || 0), 0) / reviewCount;

        const avgQualityRating =
            reviewCount === 0
                ? 0
                : reviews.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / reviewCount;

        const valueDistribution = reviews.reduce((acc, r) => {
            if (typeof r.valueRating === 'number' && acc[r.valueRating] !== undefined) {
                acc[r.valueRating]++;
            }
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>);

        const qualityDistribution = reviews.reduce((acc, r) => {
            if (typeof r.qualityRating === 'number' && acc[r.qualityRating] !== undefined) {
                acc[r.qualityRating]++;
            }
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>);

        return NextResponse.json({
            productId,
            averageValueRating: avgValueRating,
            averageQualityRating: avgQualityRating,
            valueDistribution,
            qualityDistribution,
            totalReviews: reviewCount,
        }) as NextResponse<ReviewSummary>;
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

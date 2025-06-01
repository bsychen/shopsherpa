import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);

        // Extract query parameters
        const reviewData: Record<string, any> = {};
        searchParams.forEach((value, key) => {
            reviewData[key] = value;
        });

        console.log("Review Data:", reviewData);

        // Add timestamp and user/shop id if needed
        reviewData.CreatedAt = new Date();
        reviewData.ProductId = id;

        // Create review document
        const docRef = await db.collection('reviews').add(reviewData);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
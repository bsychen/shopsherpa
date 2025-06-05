import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Fetch 3 most recently viewed products
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDocRef = db.collection('users').doc(userId);

    try {
        // Ensure the user document exists
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            await userDocRef.set({ createdAt: FieldValue.serverTimestamp() }); 
        }

        // Ensure the parent document exists before accessing the subcollection
        const recentsCollectionRef = userDocRef.collection('recentlyViewed');
        const recentsSnapshot = await recentsCollectionRef
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();

        const recentProducts = await Promise.all(
            recentsSnapshot.docs.map(async (doc) => {
                const productId = doc.id;
                const productDoc = await db.collection('products').doc(productId).get();

                const productData = productDoc.data();
                return {
                    id: productId,
                    name: productData.ProductName,
                    ...(doc.data() as Record<string, unknown>),
                };
            })
        );

        console.log(`Number of recently viewed products: ${recentProducts.length}`);
        return NextResponse.json(recentProducts);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch recent products' }, { status: 500 });
    }
}

// Add a product to recently viewed
export async function POST(req: Request) {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
        return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    const userDocRef = db.collection('users').doc(userId);

    try {
        // Ensure the user document exists
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            await userDocRef.set({});
        }

        const recentsCollectionRef = userDocRef.collection('recentlyViewed');
        const productDocRef = recentsCollectionRef.doc(productId);

        const productDoc = await productDocRef.get();

        if (!productDoc.exists) {
            await productDocRef.set({
            timestamp: FieldValue.serverTimestamp(),
            });
        } else {
            await productDocRef.update({
            timestamp: FieldValue.serverTimestamp(),
            });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to add product to recently viewed' }, { status: 500 });
    }
}

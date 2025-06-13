import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = db.collection('posts').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = docSnap.data();
    let linkedProduct = null;

    // Fetch linked product details if exists
    if (data?.linkedProductId) {
      try {
        const productDoc = await db.collection('products').doc(data.linkedProductId).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          linkedProduct = {
            id: data.linkedProductId, // Use the document ID instead of productData.id
            name: productData?.productName,
            imageUrl: productData?.imageUrl,
          };
        }
      } catch (error) {
        console.error('Error fetching linked product:', error);
      }
    }

    return NextResponse.json({
      id: docSnap.id,
      ...data,
      linkedProduct,
      createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
      updatedAt: data?.updatedAt?.toDate?.() || data?.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const postRef = db.collection('posts').doc(id);

    switch (action) {
      case 'like':
        await postRef.update({
          likes: FieldValue.arrayUnion(userId),
          dislikes: FieldValue.arrayRemove(userId), // Remove from dislikes if present
        });
        break;
      case 'dislike':
        await postRef.update({
          dislikes: FieldValue.arrayUnion(userId),
          likes: FieldValue.arrayRemove(userId), // Remove from likes if present
        });
        break;
      case 'unlike':
        await postRef.update({
          likes: FieldValue.arrayRemove(userId),
        });
        break;
      case 'undislike':
        await postRef.update({
          dislikes: FieldValue.arrayRemove(userId),
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

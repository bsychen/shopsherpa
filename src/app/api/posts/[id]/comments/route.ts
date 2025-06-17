import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Remove orderBy to avoid composite index requirement
    const commentsRef = db.collection('comments')
      .where('postId', '==', id)
      .orderBy('createdAt', 'asc'); // Sorting by createdAt

    const snapshot = await commentsRef.get();
    const comments = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let linkedProduct = null;

        // Fetch linked product details if exists
        if (data.linkedProductId) {
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

        return {
          id: docSnapshot.id,
          ...data,
          linkedProduct,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      })
    );

    // Sort comments by createdAt in JavaScript to avoid index requirement
    comments.sort((a, b) => {
      const aTime = a.createdAt.getTime();
      const bTime = b.createdAt.getTime();
      return bTime - aTime; // Changed from aTime - bTime to bTime - aTime for newest first
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, authorId, authorName, linkedProductId, parentCommentId } = body;

    if (!content || !authorId || !authorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commentData = {
      postId: id,
      content,
      authorId,
      authorName,
      linkedProductId: linkedProductId || null,
      parentCommentId: parentCommentId || null,
      likes: [],
      dislikes: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('comments').add(commentData);

    // Update post comment count
    const postRef = db.collection('posts').doc(id);
    await postRef.update({
      commentCount: FieldValue.increment(1),
    });

    return NextResponse.json({ id: docRef.id, ...commentData }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

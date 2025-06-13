import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebaseAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const body = await request.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const commentRef = db.collection('comments').doc(commentId);

    switch (action) {
      case 'like':
        await commentRef.update({
          likes: FieldValue.arrayUnion(userId),
          dislikes: FieldValue.arrayRemove(userId), // Remove from dislikes if present
        });
        break;
      case 'dislike':
        await commentRef.update({
          dislikes: FieldValue.arrayUnion(userId),
          likes: FieldValue.arrayRemove(userId), // Remove from likes if present
        });
        break;
      case 'unlike':
        await commentRef.update({
          likes: FieldValue.arrayRemove(userId),
        });
        break;
      case 'undislike':
        await commentRef.update({
          dislikes: FieldValue.arrayRemove(userId),
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

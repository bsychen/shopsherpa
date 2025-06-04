import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { UserProfile } from '@/types/user';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const docSnap = await db.collection('users').doc(userId).get();
    if (!docSnap.exists) {
      return NextResponse.json({}, { status: 404 });
    }
    const data = docSnap.data();
    const user: UserProfile = {
      userId: userId,
      username: data?.username || '',
      email: data?.email || '',
      pfp: data?.pfp || '',
    };
    return NextResponse.json(user) as NextResponse<UserProfile>;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { uid, email, username } = await req.json();
    if (!uid || !email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await db.collection('users').doc(uid).set({ email, username });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

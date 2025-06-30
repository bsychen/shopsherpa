import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function verifyAuth(request: NextRequest): Promise<{ uid: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || ''
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

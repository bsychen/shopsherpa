import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    // Get all tags without ordering to avoid index requirements
    const tagsRef = db.collection('tags');
    const snapshot = await tagsRef.get();
    
    const tags = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by usageCount in JavaScript to avoid index requirement
    tags.sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0));

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const {
      uid,
      email,
      username,
      pricePreference = 1,
      qualityPreference = 1,
      nutritionPreference = 1,
      sustainabilityPreference = 1,
      brandPreference = 1,
      alergens = [],
    } = await req.json();
    if (!uid || !email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await db.collection('users').doc(uid).set({
      email,
      username,
      pricePreference: Number(pricePreference),
      qualityPreference: Number(qualityPreference),
      nutritionPreference: Number(nutritionPreference),
      sustainabilityPreference: Number(sustainabilityPreference),
      brandPreference: Number(brandPreference),
      alergens: Array.isArray(alergens) ? alergens : [],
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

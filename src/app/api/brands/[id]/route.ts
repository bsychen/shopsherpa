import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Brand } from '@/types/brand';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await db.collection("brands").doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: doc.id,
      ...doc.data()
    }) as NextResponse<Brand>;

  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
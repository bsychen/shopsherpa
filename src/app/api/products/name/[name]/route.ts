import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import serviceAccount from '../../../key.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}
const db = admin.firestore();

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const productsSnapshot = await db
      .collection("products")
      .where("ProductNameLower", "==", params.name.toLowerCase())
      .get();

    const products: any[] = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        name: doc.data().ProductName,
        dbPrice: doc.data().ExpectedPrice,
      });
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
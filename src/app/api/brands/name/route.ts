import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the brand name from query parameters
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get("name");

    if (!brandName) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Query Firestore for the brand
    const brandQuery = await db
      .collection("brands")
      .where("brandNameLower", "==", brandName.toLowerCase())
      .limit(1)
      .get();

    // If brand doesn't exist, create it
    if (brandQuery.empty) {
      const newBrand = {
        brandName: brandName,
        brandNameLower: brandName.toLowerCase(),
        brandRating: 5
      };

      const docRef = await db.collection("brands").add(newBrand);
      return NextResponse.json({ brandId: docRef.id });
    }

    // If brand exists, return its ID
    const brand = brandQuery.docs[0];
    return NextResponse.json({ brandId: brand.id });

  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
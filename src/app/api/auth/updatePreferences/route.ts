import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebaseAdmin";

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { 
      pricePreference, 
      qualityPreference, 
      nutritionPreference, 
      sustainabilityPreference, 
      brandPreference,
      allergens 
    } = body;

    /* Validate preferences are numbers between 1-5 */
    const preferences = {
      pricePreference,
      qualityPreference,
      nutritionPreference,
      sustainabilityPreference,
      brandPreference
    };

    for (const [key, value] of Object.entries(preferences)) {
      if (value !== undefined && (typeof value !== 'number' || value < 1 || value > 5)) {
        return NextResponse.json({ error: `${key} must be a number between 1 and 5` }, { status: 400 });
      }
    }

    /* Validate allergens is an array if provided */
    if (allergens !== undefined && !Array.isArray(allergens)) {
      return NextResponse.json({ error: "allergens must be an array" }, { status: 400 });
    }

    /* Build update object with only provided fields */
    const updateData: Partial<{
      pricePreference: number;
      qualityPreference: number;
      nutritionPreference: number;
      sustainabilityPreference: number;
      brandPreference: number;
      allergens: string[];
    }> = {};
    if (pricePreference !== undefined) updateData.pricePreference = pricePreference;
    if (qualityPreference !== undefined) updateData.qualityPreference = qualityPreference;
    if (nutritionPreference !== undefined) updateData.nutritionPreference = nutritionPreference;
    if (sustainabilityPreference !== undefined) updateData.sustainabilityPreference = sustainabilityPreference;
    if (brandPreference !== undefined) updateData.brandPreference = brandPreference;
    if (allergens !== undefined) updateData.allergens = allergens;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    /* Update user preferences in Firestore */
    await db.collection("users").doc(userId).update(updateData);

    return NextResponse.json({ 
      message: "Preferences updated successfully",
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

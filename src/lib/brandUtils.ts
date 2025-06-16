import { db } from "@/lib/firebaseAdmin";

export async function getBrand(brandName: string) {
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
    return { brandId: docRef.id };
  }

  // If brand exists, return its ID
  const brand = brandQuery.docs[0];
  return { brandId: brand.id };
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriesTags = searchParams.get('tags');
    const currentProductId = searchParams.get('currentId');

    if (!categoriesTags) {
      return NextResponse.json({ error: "Categories tags parameter is required" }, { status: 400 });
    }

    /* Parse the categories tags from comma-separated string */
    const tagsArray = categoriesTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    if (tagsArray.length === 0) {
      return NextResponse.json([]);
    }

    /* Get all products that have at least one matching category tag */
    const productsSnapshot = await db
      .collection("products")
      .where("categoriesTags", "array-contains-any", tagsArray)
      .get();

    const products: (Product & { matchCount: number })[] = [];
    
    productsSnapshot.forEach(doc => {
      const productData = doc.data() as Product;
      
      /* Skip the current product */
      if (doc.id === currentProductId) {
        return;
      }
      
      /* Calculate how many tags match */
      const productTags = productData.categoriesTags || [];
      const matchCount = tagsArray.filter(tag => productTags.includes(tag)).length;
      
      /* Only include products with at least one matching tag */
      if (matchCount > 0) {
        products.push({
          id: doc.id,
          ...productData,
          matchCount
        });
      }
    });

    /* Sort by match count (descending) and limit to 10 */
    const sortedProducts = products
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 10)
      .map(({ matchCount, ...product }) => product); /* Remove matchCount from final result */

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error("Failed to fetch similar products:", error);
    return NextResponse.json({ error: "Failed to fetch similar products" }, { status: 500 });
  }
}

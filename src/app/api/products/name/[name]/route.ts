import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const productsSnapshot = await db
      .collection("products")
      .where("ProductNameLower", "==", params.name.toLowerCase())
      .get();

    const products: Product[] = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        productName: doc.data().ProductName,
        productNameLower: doc.data().ProductNameLower,
        productType: doc.data().ProductType || null,
        brandName: doc.data().BrandName || null,  
        brandTags: doc.data().BrandTags || null,
        categoriesProperties: doc.data().CategoriesProperties || null,
        categoriesPropertiesTags: doc.data().CategoriesPropertiesTags || null,
        categoriesFr: doc.data().CategoriesFr || null,
        genericName: doc.data().GenericName || null,
        genericNameEn: doc.data().GenericNameEn || null,
        countryOfOriginCode: doc.data().CountryOfOriginCode || null,
        allergenInformation: doc.data().AllergenInformation || null,
        price: doc.data().Price || 0,
        pricePerUnit: doc.data().PricePerUnit || null,
        unitOfMeasure: doc.data().UnitOfMeasure || null,
        sustainabilityCertificationCode: doc.data().SustainabilityCertificationCode || null,
        imageUrl: doc.data().ImageUrl || null,
        nutritionGrade: doc.data().NutritionGrade || null,
        nutritionGradeFr: doc.data().NutritionGradeFr || null,
        nutritionGrades: doc.data().NutritionGrades || null,
        nutritionGradesTags: doc.data().NutritionGradesTags || null,
        nutritionScoreBeverage: doc.data().NutritionScoreBeverage || null,
        expectedPrice: doc.data().ExpectedPrice || 0,
        mainCategory: doc.data().MainCategory || null,
        mainCategoryFr: doc.data().MainCategoryFr || null,
        tracesTags: doc.data().TracesTags || null,
        labels: doc.data().Labels || null,
        labelsTags: doc.data().LabelsTags || null
      });
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { Product } from '@/types/product';
import { getBrand } from '../../brands/name/route';

async function fetchProductData(id: string){
  const fields = [
    "product_name",
    "brands",
    "brands_tags",
    "categories_properties",
    "categories_properties_tags",
    "categories_tags",
    "categories_fr",
    "generic_name",
    "generic_name_en",
    "countries_tags",
    "allergens",
    "allergens_tags",
    "allergens_from_ingredients",
    "allergens_from_user",
    "allergens_hierarchy",
    "traces",
    "traces_tags",
    "traces_hierarchy",
    "price",
    "price_per_unit",
    "unit_of_measure",
    "image_url",
    "nutrition_grade_fr",
    "nutrition_grades",
    "nutrition_grades_tags",
    "nutrition_score_beverage",
    "main_category",
    "main_category_fr",
    "labels",
    "labels_tags",
    // Nutrition macros per 100g
    "nutriments",
    "energy-kcal_100g",
    "proteins_100g", 
    "carbohydrates_100g",
    "sugars_100g",
    "fat_100g",
    "saturated-fat_100g",
    "fiber_100g",
    "sodium_100g",
    // Sustainability/eco information
    "ecoscore_grade",
    "ecoscore_score",
    "ecoscore_data",
    "packaging_tags",
    "packaging_materials_tags",
  ];
  const fieldsParam = fields.join(',');
  const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${id}?fields=${encodeURIComponent(fieldsParam)}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.product || !data.product.product_name) return null;    // Get or create brandId for this product
    const brandName = data.product.brands || 
      (data.product.brands_tags && data.product.brands_tags.length > 0 ? data.product.brands_tags[0] : '') || '';
    
    // Only fetch brandId if we have a brand name
    let brandId = '';
    if (brandName) {
      try {
        const brandData = await getBrand(brandName);
        if (brandData) {
          brandId = brandData.brandId;
          console.log("Brand data:", {
            brandId: brandData ? brandData.brandId : 'Not found'
        });
        }
      } catch (error) {
        console.error('Error fetching brand:', error);
      }
    }

    return {
    productName: data.product.product_name,
    productNameLower: data.product.product_name.toLowerCase(),
    brandName: brandName,
    brandId: brandId,
    combinedCategory: [...new Set([
      ...(data.product.categories_fr ? [data.product.categories_fr] : []),
      ...(data.product.categories_properties_tags || []),
      ...(data.product.categories_properties ? Object.keys(data.product.categories_properties) : []),
      ...(data.product.main_category ? [data.product.main_category] : []),
      ...(data.product.main_category_fr ? [data.product.main_category_fr] : [])
    ])],
    genericNameLower: (data.product.generic_name || data.product.generic_name_en)
      ? (data.product.generic_name || data.product.generic_name_en).toLowerCase()
      : '',
    countryOfOriginCode: Array.isArray(data.product.countries_tags) ? data.product.countries_tags[0] : '',
    alergenInformation: [...new Set([
      ...(data.product.allergens ? [data.product.allergens] : []),
      ...(data.product.allergens_tags || []),
      //...(data.product.allergens_from_ingredients ? [data.product.allergens_from_ingredients] : []),
      //...(data.product.allergens_from_user ? [data.product.allergens_from_user] : []),
      //...(data.product.allergens_hierarchy || [])
    ])],
    tracesInformation: [...new Set([
      ...(data.product.traces ? [data.product.traces] : []),
      ...(data.product.traces_tags || []),
      ...(data.product.traces_hierarchy || [])
    ])],
    price: data.product.price || 0,
    pricePerUnit: data.product.price_per_unit || 0,
    unitOfMeasure: data.product.unit_of_measure || '',
    sustainabilityCertificationCode: Array.isArray(data.product.sustainability_labels_tags) ? data.product.sustainability_labels_tags[0] : '',
    sustainbilityScore: 3, // Default value, adjust as needed
    imageUrl: data.product.image_url || '',
    combinedNutritionGrade: data.product.nutrition_grade_en || 
      data.product.nutrition_grade_fr || 
      data.product.nutrition_grades || 
      (data.product.nutrition_grades_tags && data.product.nutrition_grades_tags.length > 0 ? data.product.nutrition_grades_tags[0] : '') || '',
    expectedPrice: 0,
    labels: [...new Set([
      ...(data.product.labels ? [data.product.labels] : []),
      ...(data.product.labels_tags || [])
    ])],
    // Nutrition macros per 100g (filter out undefined values)
    nutritionMacros: Object.fromEntries(
      Object.entries({
        energy: data.product.nutriments?.['energy-kcal_100g'] ? parseFloat(data.product.nutriments['energy-kcal_100g']) : undefined,
        proteins: data.product.nutriments?.proteins_100g ? parseFloat(data.product.nutriments.proteins_100g) : undefined,
        carbohydrates: data.product.nutriments?.carbohydrates_100g ? parseFloat(data.product.nutriments.carbohydrates_100g) : undefined,
        sugars: data.product.nutriments?.sugars_100g ? parseFloat(data.product.nutriments.sugars_100g) : undefined,
        fat: data.product.nutriments?.fat_100g ? parseFloat(data.product.nutriments.fat_100g) : undefined,
        saturatedFat: data.product.nutriments?.['saturated-fat_100g'] ? parseFloat(data.product.nutriments['saturated-fat_100g']) : undefined,
        fiber: data.product.nutriments?.fiber_100g ? parseFloat(data.product.nutriments.fiber_100g) : undefined,
        sodium: data.product.nutriments?.sodium_100g ? parseFloat(data.product.nutriments.sodium_100g) : undefined,
      }).filter(([_, value]) => value !== undefined)
    ),
    // Sustainability/eco information (filter out undefined values)
    ecoInformation: Object.fromEntries(
      Object.entries({
        ecoscore: data.product.ecoscore_grade || undefined,
        ecoscoreScore: data.product.ecoscore_data?.score ? parseFloat(data.product.ecoscore_data.score) : undefined,
        packagingInfo: [...new Set([
          ...(data.product.packaging_tags || []),
          ...(data.product.packaging_materials_tags || [])
        ])],
      }).filter(([_, value]) => value !== undefined)
    ),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const doc = await db.collection("products").doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      const response = NextResponse.json({
        id: doc.id,
        ...data,
      }) as NextResponse<Product>;
      
      // Add cache headers for existing products
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return response;
    }

    const productData = await fetchProductData(id);
    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add to Firestore
    console.log("Adding product to Firestore:", productData);
    await db.collection("products").doc(id).set(productData);
    
    const response = NextResponse.json(productData) as NextResponse<Product>;
    // Cache new products for shorter time initially
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
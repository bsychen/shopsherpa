import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";

async function fetchProductData(id: string) {
  const fields = [
    "product_name",
    "product_type",
    "brands",
    "brands_tags",
    "categories_properties",
    "categories_properties_tags",
    "categories_fr",
    "generic_name",
    "generic_name_en",
    "countries_tags",
    "allergens",
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
    "traces_tags",
    "labels",
    "labels_tags",
  ];
  const fieldsParam = fields.join(',');
  const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${id}?fields=${encodeURIComponent(fieldsParam)}`);
  if (!res.ok) return null;
  const data = await res.json();
  console.log("Fetched product data:", data);
  if (!data.product || !data.product.product_name) return null;

  return {
    productName: data.product.product_name,
    productNameLower: data.product.product_name.toLowerCase(),
    productType: data.product.product_type || null,
    brandName: data.product.brands || null,
    brandTags: data.product.brands_tags || null,
    categoriesProperties: data.product.categories_properties || null,
    categoriesPropertiesTags: data.product.categories_properties_tags || null,
    categoriesFr: data.product.categories_fr || null,
    genericName: data.product.generic_name || null,
    genericNameEn: data.product.generic_name_en || null,
    countryOfOriginCode: Array.isArray(data.product.countries_tags) ? data.product.countries_tags[0] : null,
    allergenInformation: data.product.allergens || null,
    price: data.product.price || 0,
    pricePerUnit: data.product.price_per_unit || null,
    unitOfMeasure: data.product.unit_of_measure || null,
    sustainabilityCertificationCode: Array.isArray(data.product.sustainability_labels_tags) ? data.product.sustainability_labels_tags[0] : null,
    imageUrl: data.product.image_url || null,
    nutritionGrade: data.product.nutrition_grade_en || null,
    nutritionGradeFr: data.product.nutrition_grade_fr || null,
    nutritionGrades: data.product.nutrition_grades || null,
    nutritionGradesTags: data.product.nutrition_grades_tags || null,
    nutritionScoreBeverage: data.product.nutrition_score_beverage || null,
    expectedPrice: 0,
    mainCategory: data.product.main_category || null,
    mainCategoryFr: data.product.main_category_fr || null,
    tracesTags: data.product.traces_tags || null,
    labels: data.product.labels || null,
    labelsTags: data.product.labels_tags || null,
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
      return NextResponse.json({
        id: doc.id,
        productName: data.productName,
        productNameLower: data.productNameLower,
        productType: data.productType,
        brandName: data.brandName,
        brandTags: data.brandTags,
        categoriesProperties: data.categoriesProperties,
        categoriesPropertiesTags: data.categoriesPropertiesTags,
        categoriesFr: data.categoriesFr,
        genericName: data.genericName,
        genericNameEn: data.genericNameEn,
        countryOfOriginCode: data.countryOfOriginCode,
        allergenInformation: data.allergenInformation,
        price: data.price,
        pricePerUnit: data.pricePerUnit,
        unitOfMeasure: data.unitOfMeasure,
        sustainabilityCertificationCode: data.sustainabilityCertificationCode,
        imageUrl: data.imageUrl,
        nutritionGrade: data.nutritionGrade,
        nutritionGradeFr: data.nutritionGradeFr,
        nutritionGrades: data.nutritionGrades,
        nutritionGradesTags: data.nutritionGradesTags,
        nutritionScoreBeverage: data.nutritionScoreBeverage,
        expectedPrice: data.expectedPrice,
        mainCategory: data.mainCategory,
        mainCategoryFr: data.mainCategoryFr,
        tracesTags: data.tracesTags,
        labels: data.labels,
        labelsTags: data.labelsTags,
      });
    }

    const productData = await fetchProductData(id);
    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add to Firestore
    console.log("Adding product to Firestore:", productData);
    await db.collection("products").doc(id).set(productData);
    return NextResponse.json({
      id,
      productName: productData.productName,
      productNameLower: productData.productNameLower,
      productType: productData.productType,
      brandName: productData.brandName,
      brandTags: productData.brandTags,
      categoriesProperties: productData.categoriesProperties,
      categoriesPropertiesTags: productData.categoriesPropertiesTags,
      categoriesFr: productData.categoriesFr,
      genericName: productData.genericName,
      genericNameEn: productData.genericNameEn,
      countryOfOriginCode: productData.countryOfOriginCode,
      allergenInformation: productData.allergenInformation,
      price: productData.price,
      pricePerUnit: productData.pricePerUnit,
      unitOfMeasure: productData.unitOfMeasure,
      sustainabilityCertificationCode: productData.sustainabilityCertificationCode,
      imageUrl: productData.imageUrl,
      nutritionGrade: productData.nutritionGrade,
      nutritionGradeFr: productData.nutritionGradeFr,
      nutritionGrades: productData.nutritionGrades,
      nutritionGradesTags: productData.nutritionGradesTags,
      nutritionScoreBeverage: productData.nutritionScoreBeverage,
      expectedPrice: productData.expectedPrice,
      mainCategory: productData.mainCategory,
      mainCategoryFr: productData.mainCategoryFr,
      tracesTags: productData.tracesTags,
      labels: productData.labels,
      labelsTags: productData.labelsTags,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
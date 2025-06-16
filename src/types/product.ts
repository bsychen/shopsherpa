export interface Product{
  id: string;
  productName: string;
  productNameLower: string;
  brandName: string;
  brandId: string;
  combinedCategory: string[];
  categoriesTags: string[];
  genericNameLower: string;
  countryOfOriginCode: string;
  alergenInformation: string[];
  tracesInformation: string[];
  price: number;
  pricePerUnit: number;
  unitOfMeasure: string;
  sustainabilityCertificationCode: string;
  sustainbilityScore: number;
  imageUrl: string;
  combinedNutritionGrade: string;
  expectedPrice: number;
  labels: string[];
  // Nutrition macros per 100g
  nutritionMacros: {
    energy?: number; // kcal per 100g
    proteins?: number; // g per 100g
    carbohydrates?: number; // g per 100g
    sugars?: number; // g per 100g
    fat?: number; // g per 100g
    saturatedFat?: number; // g per 100g
    fiber?: number; // g per 100g
    sodium?: number; // g per 100g
  };
  // Sustainability/eco information
  ecoInformation: {
    ecoscore?: string; // A-E grade
    ecoscoreScore?: number; // 0-100 score
    packagingInfo?: string[]; // packaging materials/info
  };
}

export interface ProductSearchResult {
  id: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
}
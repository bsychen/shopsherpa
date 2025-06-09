export interface Product{
  id: string;
  productName: string;
  productNameLower: string;
  brandName: string;
  brandId: string;
  combinedCategory: string[];
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
}

export interface ProductSearchResult {
  id: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
}
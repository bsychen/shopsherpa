export interface Product{
  id: string;
  productName: string;
  productNameLower: string;
  brandName: string;
  combinedCategory: string[];
  genericNameLower: string;
  countryOfOriginCode: string;
  alergenInformation: string[];
  tracesInformation: string[];
  price: number;
  pricePerUnit: number;
  unitOfMeasure: string;
  sustainabilityCertificationCode: string;
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
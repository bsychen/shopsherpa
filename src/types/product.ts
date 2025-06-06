export interface Product{
  id: string;
  productName: string;
  productNameLower: string;
  productType: string | null;
  brandName: string | null;
  brandTags: string[] | null;
  categoriesProperties: Record<string, unknown> | null;
  categoriesPropertiesTags: string[] | null;
  categoriesFr: string | null;
  genericName: string | null;
  genericNameEn: string | null;
  countryOfOriginCode: string | null;
  allergenInformation: string | null;
  price: number;
  pricePerUnit: number | null;
  unitOfMeasure: string | null;
  sustainabilityCertificationCode: string | null;
  imageUrl: string | null;
  nutritionGrade: string | null;
  nutritionGradeFr: string | null;
  nutritionGrades: string | null;
  nutritionGradesTags: string[] | null;
  nutritionScoreBeverage: number | null;
  expectedPrice: number;
  mainCategory: string | null;
  mainCategoryFr: string | null;
  tracesTags: string[] | null;
  labels: string | null;
  labelsTags: string[] | null;
}

export interface ProductSearchResult {
  id: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
}
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";

export const DEFAULT_RATING = 3; // Default brand rating if not available

export interface ProductScores {
  price: number;
  quality: number;
  nutrition: number;
  sustainability: number;
  brand: number;
}

export interface PriceStats {
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
}

export interface BrandStats {
  price: number;
  quality: number;
  nutrition: number;
  sustainability: number;
  overallScore: number;
  productCount: number;
}

/* Helper functions to generate quartile data for the price spectrum */
export const calculateQuartile = (arr: number[], q: number): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export function getQuartileScore(price: number, q1: number, q3: number): number {
  if (!price || q1 === q3) return 3;
  if (price <= q1) return 5;
  if (price >= q3) return 1;
  return DEFAULT_RATING;
}

export function getNutritionScore(grade: string): number {
  const scores: Record<string, number> = {
    'a': 5,
    'b': 4,
    'c': 3,
    'd': 2,
    'e': 1
  };
  return scores[grade.toLowerCase()] || 2;
}

/* Convert eco score to sustainability score (use ecoscore if available, fallback to sustainbilityScore) */
export function getSustainabilityScore(product: Product): number {  
  if (product.ecoInformation?.ecoscore && product.ecoInformation.ecoscore !== 'not-applicable') {
    const gradeScores: Record<string, number> = {
      'a-plus': 5,
      'a': 5,
      'b': 4, 
      'c': 3,
      'd': 2,
      'e': 1,
      'f': 1,
    };
    return gradeScores[product.ecoInformation.ecoscore.toLowerCase()] || DEFAULT_RATING;
  }
  
  return DEFAULT_RATING; // Default score if no ecoscore available
}

/* Calculate weighted match percentage based on user preferences and product scores */
export function calculateMatchPercentage(
  scores: ProductScores,
  preferences: { pricePreference: number; qualityPreference: number; nutritionPreference: number; sustainabilityPreference: number; brandPreference: number }
): number {
  /* Normalize preferences (ensure they sum to 1) */
  const totalPreference = preferences.pricePreference + preferences.qualityPreference + preferences.nutritionPreference + preferences.sustainabilityPreference + preferences.brandPreference;
  
  if (totalPreference === 0) return 0;
  
  const normalizedPreferences = {
    price: preferences.pricePreference / totalPreference,
    quality: preferences.qualityPreference / totalPreference,
    nutrition: preferences.nutritionPreference / totalPreference,
    sustainability: preferences.sustainabilityPreference / totalPreference,
    brand: preferences.brandPreference / totalPreference,
  };
  
  /* Calculate weighted average (scores are 1-5, convert to percentage) */
  const weightedScore = 
    (scores.price * normalizedPreferences.price) +
    (scores.quality * normalizedPreferences.quality) +
    (scores.nutrition * normalizedPreferences.nutrition) +
    (scores.sustainability * normalizedPreferences.sustainability) +
    (scores.brand * normalizedPreferences.brand);
  
  /* Convert from 1-5 scale to 0-100 percentage */
  return Math.round(((weightedScore - 1) / 4) * 100);
}

export function calculateProductScores(
  product: Product | null,
  priceStats: PriceStats,
  reviewSummary: ReviewSummary | null,
  brandStats: BrandStats | null,
  brandRating: number = DEFAULT_RATING
): ProductScores {
  const priceScore = product ? getQuartileScore(product.price || 0, priceStats.q1, priceStats.q3) : DEFAULT_RATING;
  const qualityScore = reviewSummary?.averageRating || DEFAULT_RATING;
  const nutritionScore = product ? getNutritionScore(product.combinedNutritionGrade || '') : DEFAULT_RATING;
  const sustainabilityScore = product ? getSustainabilityScore(product) : DEFAULT_RATING;
  const brandScore = brandStats?.overallScore || brandRating;

  return {
    price: priceScore,
    quality: qualityScore,
    nutrition: nutritionScore,
    sustainability: sustainabilityScore,
    brand: brandScore
  };
}

export function calculatePriceStats(products: Product[]): PriceStats {
  const getPrice = (p: Product) => p.price || 0;
  const prices = products.map(getPrice).filter(p => p > 0);
  
  if (prices.length === 0) {
    return { min: 0, max: 0, q1: 0, median: 0, q3: 0 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    q1: calculateQuartile(prices, 0.25),
    median: calculateQuartile(prices, 0.5),
    q3: calculateQuartile(prices, 0.75)
  };
}

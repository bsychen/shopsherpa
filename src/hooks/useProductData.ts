import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { ReviewSummary } from '@/types/reviewSummary';
import { 
  getProduct, 
  getReviewSummary, 
  getBrandById, 
  getProductsByBrand, 
  getSimilarProductsByCategories 
} from '@/lib/api';
import { 
  BrandStats, 
  PriceStats, 
  calculatePriceStats, 
  getNutritionScore, 
  getSustainabilityScore 
} from '@/utils/productScoring';

export function useProductData(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [brandRating, setBrandRating] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [brandReviewSummaries, setBrandReviewSummaries] = useState<Record<string, ReviewSummary>>({});

  /* Fetch initial product data */
  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      try {
        const [productData, reviewSummaryData] = await Promise.all([
          getProduct(id),
          getReviewSummary(id)
        ]);

        setProduct(productData);
        setReviewSummary(reviewSummaryData);

        if (productData) {
          /* Fetch brand data and related products */
          if (productData.brandId) {
            const brandData = await getBrandById(productData.brandId);
            setBrandRating(brandData?.brandRating || 3);
            
            const brandProds = await getProductsByBrand(productData.brandId);
            setBrandProducts(brandProds.filter(p => p.id !== id).slice(0, 8));
          }

          /* Fetch similar products */
          if (productData.categoriesTags && productData.categoriesTags.length > 0) {
            const similar = await getSimilarProductsByCategories(productData.categoriesTags, id);
            setSimilarProducts(similar);
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, [id]);

  /* Calculate similar products including current product */
  const sameProducts = useMemo(() => {
    if (!product) return [];
    return [...similarProducts.filter(p => p.categoriesTags.includes(product.categoriesTags[product.categoriesTags.length - 1])), product];
  }, [similarProducts, product]);

  /* Calculate price statistics */
  const priceStats: PriceStats = useMemo(() => {
    if (!product) return { min: 0, max: 0, q1: 0, median: 0, q3: 0 };
    
    if (sameProducts.length > 1) {
      return calculatePriceStats(sameProducts);
    } else {
      const currentPrice = product.price || 0;
      if (currentPrice > 0) {
        return {
          min: currentPrice,
          max: currentPrice,
          q1: currentPrice,
          median: currentPrice,
          q3: currentPrice
        };
      }
    }
    
    return { min: 0, max: 0, q1: 0, median: 0, q3: 0 };
  }, [sameProducts, product]);

  return {
    product,
    reviewSummary,
    similarProducts,
    brandProducts,
    brandRating,
    sameProducts,
    priceStats,
    loading,
    brandReviewSummaries,
    setBrandReviewSummaries
  };
}

export function useBrandStats(
  brandProducts: Product[], 
  product: Product | null, 
  brandReviewSummaries: Record<string, ReviewSummary>
) {
  return useMemo(() => {
    if (!brandProducts.length || !product) {
      return null;
    }

    const allBrandProducts = [...brandProducts, product];

    /* Price statistics */
    const prices = allBrandProducts.map(p => p.price || 0).filter(p => p > 0);
    let priceScore = 3;
    if (prices.length > 0) {
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)] || sortedPrices[0];
      const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)] || sortedPrices[sortedPrices.length - 1];
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      if (q1 == q3) priceScore = 3;
      else if (averagePrice < q1) priceScore = 5;
      else if (averagePrice > q3) priceScore = 2;
      else priceScore = 4 - ((averagePrice - q1) / (q3 - q1)) * 2;
    }

    /* Quality statistics */
    const reviewRatings = allBrandProducts
      .map(p => brandReviewSummaries[p.id]?.averageRating)
      .filter(rating => rating !== undefined && rating > 0);
    
    let qualityScore = 3;
    if (reviewRatings.length > 0) {
      qualityScore = reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length;
    }

    /* Nutrition and sustainability statistics */
    const nutritionScores = allBrandProducts.map(p => getNutritionScore(p.combinedNutritionGrade || ''));
    const averageNutrition = nutritionScores.length > 0 
      ? nutritionScores.reduce((a, b) => a + b, 0) / nutritionScores.length 
      : 2;

    const sustainabilityScores = allBrandProducts.map(p => getSustainabilityScore(p));
    const averageSustainability = sustainabilityScores.length > 0
      ? sustainabilityScores.reduce((a, b) => a + b, 0) / sustainabilityScores.length
      : 3;

    /* Calculate overall score */
    const roundedPrice = Math.round(priceScore * 10) / 10;
    const roundedQuality = Math.round(qualityScore * 10) / 10;
    const roundedNutrition = Math.round(averageNutrition * 10) / 10;
    const roundedSustainability = Math.round(averageSustainability * 10) / 10;
    
    const overallBrandScore = Math.round(((roundedPrice + roundedQuality + roundedNutrition + roundedSustainability) / 4) * 10) / 10;

    return {
      price: roundedPrice,
      quality: roundedQuality,
      nutrition: roundedNutrition,
      sustainability: roundedSustainability,
      overallScore: overallBrandScore,
      productCount: allBrandProducts.length
    } as BrandStats;
  }, [brandProducts, product, brandReviewSummaries]);
}

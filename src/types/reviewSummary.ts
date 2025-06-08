export interface ReviewSummary {
  productId: string;
  averageValueRating: number;
  averageQualityRating: number;
  valueDistribution: Record<number, number>; // Maps rating to count
  qualityDistribution: Record<number, number>; // Maps rating to count
  totalReviews: number;
  priceStats?: {
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
  };
}
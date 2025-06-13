export interface ReviewSummary {
  productId: string;
  averageRating: number;
  ratingDistribution: Record<number, number>; // Maps rating to count
  totalReviews: number;
  priceStats?: {
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
  };
}
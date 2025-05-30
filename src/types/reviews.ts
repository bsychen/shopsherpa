export interface Review {
  id: string;
  productId: string; 
  userId: string;  
  reviewText?: string; // Optional review text
}
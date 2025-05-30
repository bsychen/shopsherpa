export interface Review {
  id: string;
  productId: string; // Firestore reference as string (e.g. "/products/abc123")
  userId: string;    // Firestore reference as string (e.g. "/users/xyz456")
}
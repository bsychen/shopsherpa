import { useState, useEffect, useCallback } from 'react';
import { Review } from '@/types/review';
import { getProductReviews } from '@/lib/api';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export function useRealTimeReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [newlyAddedReviews, setNewlyAddedReviews] = useState<Set<string>>(new Set());

  /* Monitor online/offline status */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* Fallback function to fetch reviews via API */
  const fetchReviews = useCallback(async () => {
    try {
      const reviewsData = await getProductReviews(productId);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [productId]);

  /* Set up real-time listener for reviews */
  useEffect(() => {
    if (!productId) return;

    if (!isOnline) {
      fetchReviews();
      return;
    }

    const reviewsRef = collection(db, 'reviews');
    const reviewsQuery = query(
      reviewsRef,
      where('productId', '==', productId)
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      setIsRealTimeActive(true);
      const reviewsData = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate() : data.createdAt,
          productId: data.productId,
          reviewText: data.reviewText,
          rating: data.rating,
          userId: data.userId,
          isAnonymous: data.isAnonymous || false,
        } as Review;
      });

      /* Sort reviews by createdAt (newest first) */
      reviewsData.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      /* Filter out optimistic updates and merge with real data */
      setReviews(prevReviews => {
        const realReviews = reviewsData;
        const realReviewContents = new Set(realReviews.map(r => (r.reviewText || '').trim()));
        
        const tempReviews = prevReviews.filter(r => 
          r.id.startsWith('temp-') && !realReviewContents.has((r.reviewText || '').trim())
        );
        
        /* Detect new reviews for animation */
        const prevRealReviewIds = new Set(prevReviews.filter(r => !r.id.startsWith('temp-')).map(r => r.id));
        const newReviewIds = realReviews
          .filter(r => !prevRealReviewIds.has(r.id))
          .map(r => r.id);
        
        if (newReviewIds.length > 0) {
          setNewlyAddedReviews(prev => new Set([...prev, ...newReviewIds]));
          
          /* Use requestIdleCallback for better performance, fallback to setTimeout */
          const cleanup = () => {
            setNewlyAddedReviews(prev => {
              if (prev.size === 0) return prev;
              const updated = new Set(prev);
              for (const id of newReviewIds) {
                updated.delete(id);
              }
              return updated;
            });
          };
          
          if (typeof requestIdleCallback !== 'undefined') {
            setTimeout(() => {
              requestIdleCallback(cleanup, { timeout: 1100 });
            }, 1000);
          } else {
            setTimeout(cleanup, 1000);
          }
        }
        
        return [...realReviews, ...tempReviews];
      });
    }, (error) => {
      console.error('Error in reviews listener:', error);
      setIsRealTimeActive(false);
      fetchReviews();
    });

    return () => {
      setIsRealTimeActive(false);
      unsubscribe();
    };
  }, [productId, isOnline, fetchReviews]);

  return {
    reviews,
    setReviews,
    isRealTimeActive,
    isOnline,
    newlyAddedReviews
  };
}

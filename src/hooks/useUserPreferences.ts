import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { getUserById } from '@/lib/api';
import { UserProfile } from '@/types/user';
import { Product } from '@/types/product';

export function useUserPreferences(user: User | null) {
  const [userPreferences, setUserPreferences] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserPreferences() {
      if (!user) {
        setUserPreferences(null);
        return;
      }
      
      setLoading(true);
      try {
        const userProfile = await getUserById(user.uid);
        if (userProfile) {
          setUserPreferences(userProfile as UserProfile);
        } else {
          setUserPreferences(null);
        }
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
        setUserPreferences(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPreferences();
  }, [user]);

  return { userPreferences, loading };
}

export function useAllergenWarnings(userPreferences: UserProfile | null, product: Product | null) {
  return useMemo(() => {
    return userPreferences?.allergens && product?.alergenInformation ? 
      userPreferences.allergens.filter(userAllergen => 
        product.alergenInformation?.some(productAllergen => {
          /* Convert product allergen codes to lowercase format for comparison */
          const normalizedProductAllergen = productAllergen.trim().toLowerCase().replace(/^en:/, '');
          return normalizedProductAllergen === userAllergen.toLowerCase();
        })
      ) : [];
  }, [userPreferences?.allergens, product?.alergenInformation]);
}

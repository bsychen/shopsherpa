"use client"

import { useState, useEffect, use, Suspense, lazy, useMemo, useCallback } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/review"
import { ReviewSummary } from "@/types/reviewSummary"
import { getProduct, getProductReviews, getReviewSummary, getBrandById, getProductsByBrand, getUserById, getSimilarProductsByCategories } from "@/lib/api"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebaseClient"
import { collection, query, where, onSnapshot, orderBy as _orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useTopBar } from "@/contexts/TopBarContext"
import TabbedInfoBox from "@/components/TabbedInfoBox"
import LoadingAnimation from "@/components/LoadingSpinner";
import SimilarProducts from "@/components/SimilarProducts";
import ProductsByBrand from "@/components/ProductsByBrand";
import ProductReviews from "@/components/ProductReviews";
import AllergenWarning from "@/components/AllergenWarning";
import AllergenWarningIcon from "@/components/AllergenWarningIcon";
import ContentBox from "@/components/ContentBox";
import { UserProfile } from "@/types/user";
import { colours } from "@/styles/colours";
import { 
  getAllergenInfoFromCode, 
  getAllergenTagClasses, 
  getAllergenTagStyles,
  formatAllergenDisplay 
} from "@/utils/allergens";
import {
  getCountryInfoFromCode,
  getCountryTagClasses,
  getCountryTagStyles,
  formatCountryDisplay
} from "@/utils/countries";

// Lazy load heavy components
const ProductRadarChart = lazy(() => import("@/components/ProductRadarChart"));

// Brand statistics interface
interface BrandStats {
  price: number;
  quality: number;
  nutrition: number;
  sustainability: number;
  overallScore: number;
  productCount: number;
}

// Helper function to calculate quartiles
const calculateQuartile = (arr: number[], q: number) => {
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

function getQuartileScore(price: number, q1: number, q3: number): number {
  if (!price || q1 === q3) return 3; // Default score for invalid data
  if (price <= q1) return 5;
  if (price >= q3) return 1;
  return 3;
}

// Convert nutrition grade to score (A=5, B=4, C=3, D=2, E=1, unknown=2)
function getNutritionScore(grade: string): number {
  const scores: Record<string, number> = {
    'a': 5,
    'b': 4,
    'c': 3,
    'd': 2,
    'e': 1
  };
  return scores[grade.toLowerCase()] || 2;
}

// Convert eco score to sustainability score (use ecoscore if available, fallback to sustainbilityScore)
function getSustainabilityScore(product: Product): number {
  // Check if ecoscore is available and not "not-applicable"
  if (product.ecoInformation?.ecoscoreScore !== undefined) {
    // Convert 0-100 ecoscore to 1-5 scale
    return Math.max(1, Math.min(5, Math.round((product.ecoInformation.ecoscoreScore / 100) * 5)));
  }
  
  // Check for ecoscore grade
  if (product.ecoInformation?.ecoscore && product.ecoInformation.ecoscore !== 'not-applicable') {
    const gradeScores: Record<string, number> = {
      'a': 5,
      'b': 4, 
      'c': 3,
      'd': 2,
      'e': 1
    };
    return gradeScores[product.ecoInformation.ecoscore.toLowerCase()] || 3;
  }
  
  return product.sustainbilityScore || 3;
}

// Calculate weighted match percentage based on user preferences and product scores
function calculateMatchPercentage(
  scores: { price: number; quality: number; nutrition: number; sustainability: number; brand: number },
  preferences: { pricePreference: number; qualityPreference: number; nutritionPreference: number; sustainabilityPreference: number; brandPreference: number }
): number {
  // Normalize preferences (ensure they sum to 1)
  const totalPreference = preferences.pricePreference + preferences.qualityPreference + preferences.nutritionPreference + preferences.sustainabilityPreference + preferences.brandPreference;
  
  if (totalPreference === 0) return 0;
  
  const normalizedPreferences = {
    price: preferences.pricePreference / totalPreference,
    quality: preferences.qualityPreference / totalPreference,
    nutrition: preferences.nutritionPreference / totalPreference,
    sustainability: preferences.sustainabilityPreference / totalPreference,
    brand: preferences.brandPreference / totalPreference,
  };
  
  // Calculate weighted average (scores are 1-5, convert to percentage)
  const weightedScore = 
    (scores.price * normalizedPreferences.price) +
    (scores.quality * normalizedPreferences.quality) +
    (scores.nutrition * normalizedPreferences.nutrition) +
    (scores.sustainability * normalizedPreferences.sustainability) +
    (scores.brand * normalizedPreferences.brand);
  
  // Convert from 1-5 scale to 0-100 percentage
  return Math.round(((weightedScore - 1) / 4) * 100);
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setTopBarState, resetTopBar, setNavigating } = useTopBar();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [seeMoreClicked, setSeeMoreClicked] = useState(false);
  const [filter, setFilter] = useState<{ score: number | null }>({ score: null });
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'low' | 'high'>('recent');
  const [activeTab, setActiveTab] = useState<string>("");
  const [brandRating, setBrandRating] = useState<number>(3);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserProfile | null>(null);
  const [priceStats, setPriceStats] = useState<{
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
  }>({ min: 0, max: 0, q1: 0, median: 0, q3: 0 });
  const [showAllergenWarning, setShowAllergenWarning] = useState(false);
  const [allergenWarningDismissed, setAllergenWarningDismissed] = useState(false);
  const [brandReviewSummaries, setBrandReviewSummaries] = useState<Record<string, ReviewSummary>>({});
  const [brandStats, setBrandStats] = useState<BrandStats | null>(null);

  // Real-time states for reviews
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [newlyAddedReviews, setNewlyAddedReviews] = useState<Set<string>>(new Set());

  const sameProducts = useMemo(() => {
    if (!product) return [];
    return [...similarProducts.filter(p => p.categoriesTags.includes(product.categoriesTags[product.categoriesTags.length - 1])), product];
  }, [similarProducts, product]);
  
  // Calculate all radar chart scores
  const priceScore = product ? getQuartileScore(product.price || 0, priceStats.q1, priceStats.q3) : 3;
  const qualityScore = reviewSummary?.averageRating || 3;
  const nutritionScore = product ? getNutritionScore(product.combinedNutritionGrade || '') : 2;
  const sustainabilityScore = product ? getSustainabilityScore(product) : 3;
  const brandScore = brandStats?.overallScore || brandRating;
  
  // Calculate match percentage based on user preferences
  const matchPercentage = userPreferences && userPreferences.pricePreference !== undefined ? 
    calculateMatchPercentage(
      { price: priceScore, quality: qualityScore, nutrition: nutritionScore, sustainability: sustainabilityScore, brand: brandScore },
      { 
        pricePreference: userPreferences.pricePreference || 1,
        qualityPreference: userPreferences.qualityPreference || 1,
        nutritionPreference: userPreferences.nutritionPreference || 1,
        sustainabilityPreference: userPreferences.sustainabilityPreference || 1,
        brandPreference: userPreferences.brandPreference || 1
      }
    ) : null;
  
  // Check for allergen matches
  const allergenWarnings = useMemo(() => {
    return userPreferences?.allergens && product?.alergenInformation ? 
      userPreferences.allergens.filter(userAllergen => 
        product.alergenInformation?.some(productAllergen => {
          // Convert product allergen codes to lowercase format for comparison
          const normalizedProductAllergen = productAllergen.trim().toLowerCase().replace(/^en:/, '');
          return normalizedProductAllergen === userAllergen.toLowerCase();
        })
      ) : [];
  }, [userPreferences?.allergens, product?.alergenInformation]);

  useEffect(() => {
    setLoading(true);
    getProduct(id).then(async (productData) => {
      setProduct(productData);
      if (productData) {
        if (productData.brandId) {
          const brandData = await getBrandById(productData.brandId);
          setBrandRating(brandData?.brandRating || 3);
          
          // Fetch products from the same brand
          const brandProds = await getProductsByBrand(productData.brandId);
          // Filter out the current product and limit to 8 products
          setBrandProducts(brandProds.filter(p => p.id !== id).slice(0, 8));
        }
        // Fetch similar products based on categories_tags
        if (productData.categoriesTags && productData.categoriesTags.length > 0) {
          const similar = await getSimilarProductsByCategories(productData.categoriesTags, id);
          setSimilarProducts(similar);
        }
      }
      setLoading(false);
      setNavigating(false); // Clear navigation loading state
    });
    getReviewSummary(id).then(setReviewSummary);
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, [id, setNavigating]);

  // Monitor online/offline status
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

  // Fallback function to fetch reviews via API
  const fetchReviews = useCallback(async () => {
    try {
      const reviewsData = await getProductReviews(id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]);

  // Set up real-time listener for reviews
  useEffect(() => {
    if (!id) return;

    if (!isOnline) {
      // If offline, fallback to API call
      fetchReviews();
      return;
    }

    const reviewsRef = collection(db, 'reviews');
    // Remove orderBy to avoid composite index requirement - we'll sort in JavaScript
    const reviewsQuery = query(
      reviewsRef,
      where('productId', '==', id)
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

      // Sort reviews by createdAt in JavaScript (newest first)
      reviewsData.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime; // Newest first
      });

      // Filter out optimistic updates and merge with real data
      setReviews(prevReviews => {
        const realReviews = reviewsData;
        
        // Get all real review contents to match against optimistic ones
        const realReviewContents = new Set(realReviews.map(r => (r.reviewText || '').trim()));
        
        // Keep only temp reviews that don't have a matching real review yet
        const tempReviews = prevReviews.filter(r => 
          r.id.startsWith('temp-') && !realReviewContents.has((r.reviewText || '').trim())
        );
        
        // Detect new reviews for animation (only real reviews that weren't in previous state)
        const prevRealReviewIds = new Set(prevReviews.filter(r => !r.id.startsWith('temp-')).map(r => r.id));
        const newReviewIds = realReviews
          .filter(r => !prevRealReviewIds.has(r.id))
          .map(r => r.id);
        
        if (newReviewIds.length > 0) {
          setNewlyAddedReviews(prev => new Set([...prev, ...newReviewIds]));
          // Remove animation class after animation duration
          setTimeout(() => {
            setNewlyAddedReviews(prev => {
              const updated = new Set(prev);
              newReviewIds.forEach(id => updated.delete(id));
              return updated;
            });
          }, 1000); // Remove animation after 1 second
        }
        
        return [...realReviews, ...tempReviews];
      });
    }, (error) => {
      console.error('Error in reviews listener:', error);
      setIsRealTimeActive(false);
      // Fallback to API call if real-time fails
      fetchReviews();
    });

    return () => {
      setIsRealTimeActive(false);
      unsubscribe();
    };
  }, [id, isOnline, fetchReviews]);

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
      onBackClick: () => router.back()
    });

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router]);

  // Fetch user preferences when user changes
  useEffect(() => {
    async function fetchUserPreferences() {
      if (!user) {
        setUserPreferences(null);
        return;
      }
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
      }
    }
    fetchUserPreferences();
  }, [user]);

  // Show allergen warning when product and user preferences are loaded
  useEffect(() => {
    if (product && userPreferences && allergenWarnings && allergenWarnings.length > 0 && !allergenWarningDismissed) {
      setShowAllergenWarning(true);
    }
  }, [product, userPreferences, allergenWarnings, allergenWarningDismissed]);

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
    });

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar]);

  // Handler functions for allergen warning
  const handleAllergenWarningClose = () => {
    setShowAllergenWarning(false);
  };

  const handleAllergenWarningProceed = () => {
    setAllergenWarningDismissed(true);
    setShowAllergenWarning(false);
  };

  useEffect(() => {
    async function fetchUsernames() {
      const ids = Array.from(new Set(reviews.map(r => r.userId)));
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async (uid) => {
        if (!uid) return;
        try {
          const user = await import("@/lib/api").then(m => m.getUserById(uid));
          if (user && typeof user.username === "string") names[uid] = user.username;
        } catch {}
      }));
      setUsernames(names);
    }
    if (reviews.length) fetchUsernames();
  }, [reviews]);

  useEffect(() => {
    async function recordVisit() {
      if (!user) return;
      try {
        await fetch("/api/products/recents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, productId: id }),
        });
      } catch (error) {
        console.error("Failed to record visit:", error);
      }
    }
    recordVisit();
  }, [id, user]);

  // Calculate price statistics when similar products change
  useEffect(() => {
    if (!product) return;
    
    const getPrice = (p: Product) => p.price || p.expectedPrice || 0;
    const currentProductPrice = getPrice(product);
    
    // If we have similar products, include them in the calculation
    if (sameProducts.length > 1) {
      const prices = sameProducts.map(getPrice).filter(p => p > 0);
      
      if (prices.length > 0) {
        setPriceStats({
          min: Math.min(...prices),
          max: Math.max(...prices),
          q1: calculateQuartile(prices, 0.25),
          median: calculateQuartile(prices, 0.5),
          q3: calculateQuartile(prices, 0.75)
        });
      } else if (currentProductPrice > 0) {
        // If no similar products have prices, use current product as baseline
        setPriceStats({
          min: currentProductPrice,
          max: currentProductPrice,
          q1: currentProductPrice,
          median: currentProductPrice,
          q3: currentProductPrice
        });
      }
    } else if (currentProductPrice > 0) {
      // If no similar products, use current product as sole data point
      setPriceStats({
        min: currentProductPrice,
        max: currentProductPrice,
        q1: currentProductPrice,
        median: currentProductPrice,
        q3: currentProductPrice
      });
    }
  }, [sameProducts, product]);

  // Fetch review summaries for all brand products
  useEffect(() => {
    if (!brandProducts.length || !product) return;

    const fetchBrandReviewSummaries = async () => {
      const summaries: Record<string, ReviewSummary> = {};
      
      // Include current product
      const allBrandProducts = [...brandProducts, product];
      
      try {
        await Promise.all(
          allBrandProducts.map(async (brandProduct) => {
            const summary = await getReviewSummary(brandProduct.id);
            if (summary) {
              summaries[brandProduct.id] = summary;
            }
          })
        );
        setBrandReviewSummaries(summaries);
      } catch (error) {
        console.error('Error fetching brand review summaries:', error);
      }
    };

    fetchBrandReviewSummaries();
  }, [brandProducts, product]);

  // Calculate brand statistics when brand products and review summaries change
  useEffect(() => {
    if (!brandProducts.length || !product) {
      setBrandStats(null);
      return;
    }

    // Include current product in calculations
    const allBrandProducts = [...brandProducts, product];

    // Price statistics (use quartile-based scoring like the main product)
    const prices = allBrandProducts.map(p => p.price || 0).filter(p => p > 0);
    let priceScore = 3; // default
    if (prices.length > 0) {
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)] || sortedPrices[0];
      const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)] || sortedPrices[sortedPrices.length - 1];
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Lower prices get higher scores
      if (q1 == q3) priceScore = 3; // No variation in prices
      else if (averagePrice < q1) priceScore = 5;
      else if (averagePrice > q3) priceScore = 2;
      else priceScore = 4 - ((averagePrice - q1) / (q3 - q1)) * 2; // Scale between 2-4
    }

    // Quality statistics (based on actual review ratings from all brand products)
    const reviewRatings = allBrandProducts
      .map(p => brandReviewSummaries[p.id]?.averageRating)
      .filter(rating => rating !== undefined && rating > 0);
    
    let qualityScore = 3;
    if (reviewRatings.length > 0) {
      qualityScore = reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length;
    }

    // Nutrition statistics
    const nutritionScores = allBrandProducts.map(p => getNutritionScore(p.combinedNutritionGrade || ''));
    const averageNutrition = nutritionScores.length > 0 
      ? nutritionScores.reduce((a, b) => a + b, 0) / nutritionScores.length 
      : 2;

    // Sustainability statistics
    const sustainabilityScores = allBrandProducts.map(p => getSustainabilityScore(p));
    const averageSustainability = sustainabilityScores.length > 0
      ? sustainabilityScores.reduce((a, b) => a + b, 0) / sustainabilityScores.length
      : 3;

    // Calculate overall brand score as average of all components
    const roundedPrice = Math.round(priceScore * 10) / 10;
    const roundedQuality = Math.round(qualityScore * 10) / 10;
    const roundedNutrition = Math.round(averageNutrition * 10) / 10;
    const roundedSustainability = Math.round(averageSustainability * 10) / 10;
    
    const overallBrandScore = Math.round(((roundedPrice + roundedQuality + roundedNutrition + roundedSustainability) / 4) * 10) / 10;

    setBrandStats({
      price: roundedPrice,
      quality: roundedQuality,
      nutrition: roundedNutrition,
      sustainability: roundedSustainability,
      overallScore: overallBrandScore,
      productCount: allBrandProducts.length
    });
  }, [brandProducts, product, brandRating, brandReviewSummaries]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!product) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-[60vh] p-4"
        style={{ backgroundColor: colours.background.secondary }}
      >
        <div 
          className="text-lg mb-4"
          style={{ color: colours.status.error.text }}
        >
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[60vh] p-4 "
      style={{ backgroundColor: colours.background.secondary }}
    >
      {/* Allergen Warning Modal */}
      {showAllergenWarning && (
        <AllergenWarning 
          allergenWarnings={allergenWarnings}
                isVisible={showAllergenWarning}
                onClose={handleAllergenWarningClose}
                onProceed={handleAllergenWarningProceed}
        />
      )}
      {/* Main Product Card */}
      <ContentBox className="flex flex-col items-center border relative">
        {/* Header with title, product name and ID */}
        <div className="w-full flex items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <AllergenWarningIcon 
                hasAllergens={allergenWarnings && allergenWarnings.length > 0}
                onClick={() => setShowAllergenWarning(true)}
              />
              <div className="flex-1 min-w-0">
                <h1 
                  className="text-2xl font-bold text-left m-0 p-0 leading-tight truncate"
                  style={{ color: colours.text.primary }}
                >
                  {product.productName}
                </h1>
                <span 
                  className="text-m mt-0.5 truncate block font-semibold"
                  style={{ color: colours.text.muted }}
                >
                  {product.brandName}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Spider Web Diagram Box */}
        <div className="w-full max-w-xl flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-full" style={{ minHeight: 280, minWidth: 0 }}>
            <Suspense fallback={<div className="flex items-center justify-center w-full h-52">
              <LoadingAnimation size="medium" />
            </div>}>
              <ProductRadarChart
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                priceScore={priceScore}
                qualityScore={qualityScore}
                nutritionScore={nutritionScore}
                sustainabilityScore={sustainabilityScore}
                brandScore={brandScore}
                matchPercentage={matchPercentage}
                allergenWarnings={allergenWarnings}
                onAllergenWarningClick={() => setShowAllergenWarning(true)}
              />
            </Suspense>
          </div>
          {/* Tabbed Info Box */}
          <TabbedInfoBox
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            product={product}
            reviewSummary={reviewSummary}
            brandStats={brandStats}
            priceStats={priceStats}
            maxPriceProduct={sameProducts.reduce((max, p) => (!max || (p.price || 0) > (max.price || 0)) ? p : max, null)}
            minPriceProduct={sameProducts.reduce((min, p) => (!min || (p.price || 0) < (min.price || 0)) ? p : min, null)}
          />
          {(product.alergenInformation && product.alergenInformation.length > 0 || product.labels && product.labels.length > 0 || product.countryOfOriginCode) && (
            <div className="w-full">
              <div 
                className="text-xs font-semibold mt-2 mb-1 ml-1"
                style={{ color: colours.text.secondary }}
              >
                Allergens & Labels:
              </div>
              <div className="flex flex-wrap gap-2 mb-2 justify-start">
                {/* Allergen tags (red) */}
                {product.alergenInformation && product.alergenInformation.map((allergen, idx) => {
                  const allergenInfo = getAllergenInfoFromCode(allergen);
                  if (!allergenInfo) return null;
                  return (
                    <span
                      key={`allergen-${idx}`}
                      className={getAllergenTagClasses()}
                      style={{ ...getAllergenTagStyles(), whiteSpace: 'nowrap' }}
                    >
                      {formatAllergenDisplay(allergenInfo)}
                    </span>
                  );
                })}
                {/* Country of origin tag (blue) */}
                {product.countryOfOriginCode && (() => {
                  const countryInfo = getCountryInfoFromCode(product.countryOfOriginCode);
                  if (!countryInfo) return null;
                  return (
                    <span
                      key="country-origin"
                      className={getCountryTagClasses()}
                      style={{ ...getCountryTagStyles(), whiteSpace: 'nowrap' }}
                    >
                      {formatCountryDisplay(countryInfo)}
                    </span>
                  );
                })()}
                {/* Label tags (grey) */}
                {product.labels && product.labels.map((label, idx) => {
                  const key = label.trim().toLowerCase();
                  const map = LABEL_MAP[key];
                  if (!map) return null;
                  return (
                    <span
                      key={`label-${idx}`}
                      className="inline-block border-2 text-sm px-3 py-1.5 rounded-full font-semibold shadow-lg transition"
                      style={{ 
                        whiteSpace: 'nowrap',
                        backgroundColor: colours.tag.default.background,
                        borderColor: colours.tag.default.border,
                        color: colours.tag.default.text
                      }}
                    >
                      {`${map.emoji} ${map.title}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
       </ContentBox>

        {/* Similar Products Section */}
        <SimilarProducts 
          products={similarProducts}
          currentProductId={id}
        />
        {/* More by this brand Section */}
        <ProductsByBrand 
          products={brandProducts}
          brandName={product.brandName || 'Unknown Brand'}
          currentProductId={id}
        />
        {/* Reviews Section */}
        <ProductReviews
          reviews={reviews}
          usernames={usernames}
          user={userPreferences}
          productId={id}
          refreshing={refreshing}
          visibleReviews={visibleReviews}
          setVisibleReviews={setVisibleReviews}
          setSeeMoreClicked={setSeeMoreClicked}
          seeMoreClicked={seeMoreClicked}
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setRefreshing={setRefreshing}
          _isRealTimeActive={isRealTimeActive}
          _isOnline={isOnline}
          newlyAddedReviews={newlyAddedReviews}
        />
      </div>
             
  );
}

// Label mapping: maps Open Food Facts label codes to display name and emoji
const LABEL_MAP: Record<string, { title: string; emoji: string }> = {
  'en:vegetarian': { title: 'Vegetarian', emoji: '🥦' },
  'en:vegan': { title: 'Vegan', emoji: '🌱' },
  'en:organic': { title: 'Organic', emoji: '🍃' },
  'en:halal': { title: 'Halal', emoji: '🕌' },
  'en:kosher': { title: 'Kosher', emoji: '✡️' },
  'en:palm-oil-free': { title: 'Palm Oil Free', emoji: '🌴🚫' },
  'en:fair-trade': { title: 'Fair Trade', emoji: '🤝' },
  'en:lactose-free': { title: 'Lactose-Free', emoji: '🥛🚫' },
  // Add more as needed
};

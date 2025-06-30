"use client"

import { useState, useEffect, use, Suspense, lazy, useMemo } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { getUserById, getReviewSummary } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useTopBar } from "@/contexts/TopBarContext"
import TabbedInfoBox from "@/components/product/tabs/TabbedInfoBox"
import LoadingAnimation from "@/components/LoadingSpinner";
import SimilarProducts from "@/components/product/SimilarProducts";
import ProductsByBrand from "@/components/product/ProductsByBrand";
import ProductReviews from "@/components/product/ProductReviews";
import AllergenWarning from "@/components/product/allergens/AllergenWarning";
import AllergenWarningIcon from "@/components/product/allergens/AllergenWarningIcon";
import ContentBox from "@/components/community/ContentBox";
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
import { calculateProductScores, calculateMatchPercentage } from "@/utils/productScoring";
import { getLabelInfo, formatLabelDisplay } from "@/utils/labels";
import { useUserPreferences, useAllergenWarnings } from "@/hooks/useUserPreferences";
import { useProductData, useBrandStats } from "@/hooks/useProductData";
import { useRealTimeReviews } from "@/hooks/useRealTimeReviews";

/* Lazy load heavy components */
const ProductRadarChart = lazy(() => import("@/components/product/ProductRadarChart"));

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setTopBarState, resetTopBar, setNavigating } = useTopBar();
  const [user, setUser] = useState<User | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [seeMoreClicked, setSeeMoreClicked] = useState(false);
  const [filter, setFilter] = useState<{ score: number | null }>({ score: null });
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'low' | 'high'>('recent');
  const [activeTab, setActiveTab] = useState<string>("");
  const [showAllergenWarning, setShowAllergenWarning] = useState(false);
  const [allergenWarningDismissed, setAllergenWarningDismissed] = useState(false);

  /* Custom hooks for data management */
  const { 
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
  } = useProductData(id);

  const { userPreferences } = useUserPreferences(user);
  const allergenWarnings = useAllergenWarnings(userPreferences, product);
  const brandStats = useBrandStats(brandProducts, product, brandReviewSummaries);
  const { reviews, setReviews, isRealTimeActive, isOnline, newlyAddedReviews } = useRealTimeReviews(id);

  // Calculate scores using utility functions
  const scores = calculateProductScores(product, priceStats, reviewSummary, brandStats, brandRating);
  
  // Calculate match percentage based on user preferences
  const matchPercentage = userPreferences && userPreferences.pricePreference !== undefined ? 
    calculateMatchPercentage(
      scores,
      { 
        pricePreference: userPreferences.pricePreference || 1,
        qualityPreference: userPreferences.qualityPreference || 1,
        nutritionPreference: userPreferences.nutritionPreference || 1,
        sustainabilityPreference: userPreferences.sustainabilityPreference || 1,
        brandPreference: userPreferences.brandPreference || 1
      }
    ) : null;

  // Auth state management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
      onBackClick: () => router.back()
    });

    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar, router]);

  // Show allergen warning when conditions are met
  useEffect(() => {
    if (product && userPreferences && allergenWarnings && allergenWarnings.length > 0 && !allergenWarningDismissed) {
      setShowAllergenWarning(true);
    }
  }, [product, userPreferences, allergenWarnings, allergenWarningDismissed]);

  // Fetch usernames for reviews
  useEffect(() => {
    async function fetchUsernames() {
      const ids = Array.from(new Set(reviews.map(r => r.userId)));
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async (uid) => {
        if (!uid) return;
        try {
          const user = await getUserById(uid);
          if (user && typeof user.username === "string") names[uid] = user.username;
        } catch {}
      }));
      setUsernames(names);
    }
    if (reviews.length) fetchUsernames();
  }, [reviews]);

  // Record visit for analytics
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

  // Fetch review summaries for brand products
  useEffect(() => {
    if (!brandProducts.length || !product) return;

    const fetchBrandReviewSummaries = async () => {
      const summaries: Record<string, any> = {};
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
  }, [brandProducts, product, setBrandReviewSummaries]);

  // Handler functions for allergen warning
  const handleAllergenWarningClose = () => {
    setShowAllergenWarning(false);
  };

  const handleAllergenWarningProceed = () => {
    setAllergenWarningDismissed(true);
    setShowAllergenWarning(false);
  };

  // Clear navigation loading state when product data is loaded
  useEffect(() => {
    if (!loading) {
      setNavigating(false);
    }
  }, [loading, setNavigating]);

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
                priceScore={scores.price}
                qualityScore={scores.quality}
                nutritionScore={scores.nutrition}
                sustainabilityScore={scores.sustainability}
                brandScore={scores.brand}
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
                  const labelInfo = getLabelInfo(label);
                  if (!labelInfo) return null;
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
                      {formatLabelDisplay(labelInfo)}
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

"use client"

import { useState, useEffect, use } from "react"
import { Product } from "@/types/product"
import { Review } from "@/types/review"
import { ReviewSummary } from "@/types/reviewSummary"
import { getProduct, getProductReviews, getReviewSummary, getBrandById, getProductsWithGenericName, getProductsByBrand, getUserById } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"
import ProductRadarChart from "@/components/ProductRadarChart";
import { useRef } from "react";
import TabbedInfoBox from "@/components/TabbedInfoBox"
import LoadingAnimation from "@/components/LoadingSpinner";
import { UserProfile } from "@/types/user";
import { 
  getAllergenInfoFromCode, 
  getAllergenTagClasses, 
  formatAllergenDisplay 
} from "@/utils/allergens";
import {
  getCountryInfoFromCode,
  getCountryTagClasses,
  formatCountryDisplay
} from "@/utils/countries";

function AnimatedMatchPercent({ percent, small }: { percent: number, small?: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplayed(Math.round(percent * progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayed(percent);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [percent]);

  // Color logic
  const color = displayed >= 70
    ? { text: "#166534" }
    : displayed >= 50
    ? { text: "#a16207" }
    : { text: "#b91c1c" };

  return (
    <span
      className={`relative flex flex-col items-center justify-center ml-2 ${small ? 'min-w-[40px] min-h-[40px]' : 'min-w-[64px] min-h-[64px]'}`}
    >
      <span
        className={`font-bold ${small ? 'text-base' : 'text-xl'}`}
        style={{ color: color.text, pointerEvents: 'none', userSelect: 'none' }}
      >
        {displayed}%
      </span>
      <span className={`block font-medium mt-1 text-zinc-500 text-center ${small ? 'text-[10px]' : 'text-xs'}`}>match</span>
    </span>
  );
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
  console.log("Calculating quartile score for price:", price, "Q1:", q1, "Q3:", q3);
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
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [_animatedValue, setAnimatedValue] = useState(0);
  const [_animatedQuality, setAnimatedQuality] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [seeMoreClicked, setSeeMoreClicked] = useState(false);
  const [filter, setFilter] = useState<{ score: number | null }>({ score: null });
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'critical' | 'favourable'>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Price");
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
  
  // Calculate all radar chart scores
  const priceScore = product ? getQuartileScore(product.price || 0, priceStats.q1, priceStats.q3) : 3;
  const qualityScore = reviewSummary?.averageRating || 3;
  const nutritionScore = product ? getNutritionScore(product.combinedNutritionGrade || '') : 2;
  const sustainabilityScore = product?.sustainbilityScore || 3;
  const brandScore = brandRating;
  
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
  const allergenWarnings = userPreferences?.allergens && product?.alergenInformation ? 
    userPreferences.allergens.filter(userAllergen => 
      product.alergenInformation?.some(productAllergen => {
        // Convert product allergen codes to lowercase format for comparison
        const normalizedProductAllergen = productAllergen.trim().toLowerCase().replace(/^en:/, '');
        return normalizedProductAllergen === userAllergen.toLowerCase();
      })
    ) : [];
  
  const router = useRouter();

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
        // Fetch similar products based on genericName
        if (productData.genericNameLower) {
          const similar = await getProductsWithGenericName(productData.genericNameLower);
          console.log('Similar products:', similar);
          // Filter out the current product and limit to 8 products
          setSimilarProducts(similar.filter(p => p.id !== id).slice(0, 8));
        }
      }
      setLoading(false);
    });
    getProductReviews(id).then(data => setReviews(data || []));
    getReviewSummary(id).then(setReviewSummary);
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (reviewSummary) {
      setTimeout(() => setAnimatedValue(reviewSummary.averageRating), 50);
      setTimeout(() => setAnimatedQuality(reviewSummary.averageRating), 50);
    }
  }, [reviewSummary]);

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

  const handleWriteReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push(`/review/create/${id}`);
    } else {
      localStorage.setItem("postAuthRedirect", `/review/create/${id}`);
      router.push("/auth");
    }
  };

  const filteredReviews = filter.score !== null
    ? reviews.filter(r => r.rating === filter.score)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (sortBy === 'recent') return bDate - aDate;
    const aScore = a.rating || 0;
    const bScore = b.rating || 0;
    if (sortBy === 'critical') return aScore !== bScore ? aScore - bScore : bDate - aDate;
    if (sortBy === 'favourable') return aScore !== bScore ? bScore - aScore : bDate - aDate;
    return 0;
  });

  useEffect(() => {
    if (filter.score !== null || sortOpen === false) {
      setRefreshing(true);
      const timeout = setTimeout(() => setRefreshing(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [filter, sortBy, sortOpen]);

  // Calculate price statistics when similar products change
  useEffect(() => {
    if (!product || !similarProducts.length) return;
    
    const getPrice = (p: Product) => p.price || p.expectedPrice || 0;
    const prices = [...similarProducts.map(getPrice), getPrice(product)].filter(p => p > 0);
    
    if (prices.length) {
      setPriceStats({
        min: Math.min(...prices),
        max: Math.max(...prices),
        q1: calculateQuartile(prices, 0.25),
        median: calculateQuartile(prices, 0.5),
        q3: calculateQuartile(prices, 0.75)
      });
    }
  }, [similarProducts, product]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
        <div className="text-lg text-red-600 mb-4">Product not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-zinc-50 dark:bg-zinc-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-6 flex flex-col items-center border border-zinc-200 relative">
        <div className="absolute left-6 top-6">
          <Link href="/" className="flex items-center text-blue-600 hover:underline">
            <span className="mr-2 text-2xl">&#8592;</span>
            <span className="font-semibold">Go back home</span>
          </Link>
        </div>
        {/* Product Info Card */}
        <div className="w-full flex flex-row items-center justify-between mt-10 mb-4 bg-zinc-100 border border-zinc-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-row items-center gap-4 w-full">
            <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
              <button
                className="w-full text-left focus:outline-none"
                onClick={() => setImageDropdownOpen((v) => !v)}
                aria-expanded={imageDropdownOpen}
                aria-controls="product-image-dropdown"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <h1 className="text-2xl font-bold text-zinc-800 text-left m-0 p-0 leading-tight truncate max-w-[320px] md:max-w-[520px]">
                  {product.productName}
                  <span className="ml-2 align-middle inline-block text-base text-zinc-400">{imageDropdownOpen ? '▲' : '▼'}</span>
                </h1>
                <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px] md:max-w-[420px]">Product ID: {product.id}</span>
              </button>
              {imageDropdownOpen && product.imageUrl && (
                <div id="product-image-dropdown" className="mt-3 w-full flex justify-center">
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    width={128}
                    height={128}
                    className="object-contain rounded border border-zinc-200 bg-zinc-100 h-24 w-24 md:h-32 md:w-32 shadow"
                    style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end justify-center min-w-[48px] md:min-w-[64px] flex-shrink-0">
              {matchPercentage !== null ? (
                <AnimatedMatchPercent percent={matchPercentage} small />
              ) : (
                <span className="relative flex flex-col items-center justify-center ml-2 min-w-[40px] min-h-[40px]">
                  <span className="font-bold text-base text-zinc-400">--</span>
                  <span className="block font-medium mt-1 text-zinc-500 text-center text-[10px]">match</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Allergen Warning Banner */}
        {allergenWarnings && allergenWarnings.length > 0 && (
          <div className="w-full max-w-xl mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-sm mb-1">Allergen Warning</h3>
                <p className="text-red-700 text-sm">
                  This product contains allergens that match your profile: {allergenWarnings.map(allergen => allergen.replace(/-/g, ' ')).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Spider Web Diagram Box */}
        <div className="w-full max-w-xl flex flex-col items-center mb-4">
          <div className="flex items-center justify-center w-full" style={{ minHeight: 220, minWidth: 0 }}>
            <ProductRadarChart
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              priceScore={priceScore}
              qualityScore={qualityScore}
              nutritionScore={nutritionScore}
              sustainabilityScore={sustainabilityScore}
              brandScore={brandScore}
            />
          </div>
          {/* Tabbed Info Box */}
          <TabbedInfoBox
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            product={product}
            reviewSummary={reviewSummary}
            brandRating={brandRating}
            priceStats={priceStats}
            maxPriceProduct={similarProducts.reduce((max, p) => (!max || (p.price || 0) > (max.price || 0)) ? p : max, null)}
            minPriceProduct={similarProducts.reduce((min, p) => (!min || (p.price || 0) < (min.price || 0)) ? p : min, null)}
          />
          {(product.alergenInformation && product.alergenInformation.length > 0 || product.labels && product.labels.length > 0 || product.countryOfOriginCode) && (
            <div className="w-full">
              <div className="text-xs text-zinc-500 font-semibold mt-2 mb-1 ml-1">Allergens & Labels:</div>
              <div className="flex flex-wrap gap-2 mb-2 justify-start">
                {/* Allergen tags (red) */}
                {product.alergenInformation && product.alergenInformation.map((allergen, idx) => {
                  const allergenInfo = getAllergenInfoFromCode(allergen);
                  if (!allergenInfo) return null;
                  return (
                    <span
                      key={`allergen-${idx}`}
                      className={getAllergenTagClasses()}
                      style={{ whiteSpace: 'nowrap' }}
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
                      style={{ whiteSpace: 'nowrap' }}
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
                      className="inline-block bg-zinc-100 border border-zinc-300 text-zinc-700 text-sm px-3 py-1.5 rounded-full font-semibold shadow-sm hover:bg-zinc-200 hover:text-zinc-900 transition"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {`${map.emoji} ${map.title}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Similar Products Section */}
        <div className="w-full max-w-xl flex flex-col items-start mb-4">
          <div className="w-full bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-800 mb-3 px-1">Similar Products</h2>
            <div className="w-full overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
              <div 
                className="flex space-x-4 px-1 scroll-pl-6" 
                style={{ 
                  width: 'max-content',
                  scrollSnapType: 'x mandatory',
                  scrollPaddingLeft: '50%',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {similarProducts.length > 0 ? similarProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    className="flex flex-col items-center bg-white border border-zinc-200 rounded-lg p-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:opacity-100"
                    style={{ 
                      width: '100px', 
                      flex: '0 0 auto',
                      scrollSnapAlign: 'center',
                      opacity: 0.85,
                    }}
                  >
                    <Image
                      src={prod.imageUrl || "/placeholder.jpg"}
                      alt={prod.productName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded mb-2 border border-zinc-200 bg-white"
                    />
                    <div className="font-medium text-xs text-zinc-700 text-center mb-1 line-clamp-2 w-full">
                      {prod.productName}
                    </div>
                    <div className="text-[10px] text-zinc-500 mb-1">{prod.brandName || 'Unknown Brand'}</div>
                    <button 
                      onClick={() => router.push(`/product/${prod.id}`)}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </div>
                )) : (
                  <div className="w-full text-center text-zinc-500 text-sm py-4">
                    No similar products found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* More by this brand Section */}
        <div className="w-full max-w-xl flex flex-col items-start mb-4">
          <div className="w-full bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-800 mb-3 px-1">More by {product.brandName}</h2>
            <div className="w-full overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
              <div 
                className="flex space-x-4 px-1 scroll-pl-6" 
                style={{ 
                  width: 'max-content',
                  scrollSnapType: 'x mandatory',
                  scrollPaddingLeft: '50%',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {brandProducts.length > 0 ? brandProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    className="flex flex-col items-center bg-white border border-zinc-200 rounded-lg p-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:opacity-100"
                    style={{ 
                      width: '100px', 
                      flex: '0 0 auto',
                      scrollSnapAlign: 'center',
                      opacity: 0.85,
                    }}
                  >
                    <Image
                      src={prod.imageUrl || "/placeholder.jpg"}
                      alt={prod.productName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded mb-2 border border-zinc-200 bg-white"
                    />
                    <div className="font-medium text-xs text-zinc-700 text-center mb-1 line-clamp-2 w-full">
                      {prod.productName}
                    </div>
                    <div className="text-[10px] text-zinc-500 mb-1">{prod.brandName || 'Unknown Brand'}</div>
                    <button 
                      onClick={() => router.push(`/product/${prod.id}`)}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </div>
                )) : (
                  <div className="w-full text-center text-zinc-500 text-sm py-4">
                    No other products from this brand
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="w-full">
          <div className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 transition-all duration-300 ${refreshing ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-0'}`}>
            <div className="flex items-center justify-between w-full mb-2">
              <h2 className="text-xl font-semibold text-zinc-800">Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="inline-flex items-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold px-3 h-10 rounded-lg transition text-sm"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                  >
                    Sort by
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {sortOpen && (
                    <ul className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg z-20" role="listbox">
                      {['recent', 'critical', 'favourable'].map(option => (
                        <li key={option}>
                          <button
                            className={`w-full text-left px-4 py-2 hover:bg-zinc-100 transition-all duration-200 rounded ${sortBy === option ? 'bg-blue-100 text-blue-700 shadow ring-2 ring-blue-300 scale-[1.04]' : ''}`}
                            onClick={() => { setSortBy(option as typeof sortBy); setSortOpen(false); setRefreshing(true); setTimeout(() => setRefreshing(false), 350); }}
                            role="option"
                            aria-selected={sortBy === option}
                          >
                            {option === 'recent' ? 'Most Recent' : option === 'critical' ? 'Most Critical' : 'Most Favourable'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={handleWriteReview}
                  className="inline-flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xl px-4 h-10 rounded-lg transition ml-2 mb-0"
                  aria-label="Write a Review"
                >
                  <span className="w-full flex items-center justify-center" style={{lineHeight: 1}}>
                    <span className="text-xl leading-none flex items-center justify-center">+</span>
                  </span>
                </button>
              </div>
            </div>
            {sortedReviews.length === 0 ? (
              <div className="text-zinc-500">No reviews{filter.score ? ` with ${filter.score} star${filter.score > 1 ? 's' : ''}` : ''}.</div>
            ) : (
              <>
                <ul className="space-y-4">
                  {sortedReviews.slice(0, visibleReviews).map((review, idx) => {
                    let opacity = 1;
                    if (!seeMoreClicked && visibleReviews === 3 && !filter.score) {
                      opacity = 1 - idx * 0.3;
                    }
                    return (
                      <li key={review.id} style={{ opacity }}>
                        <Link href={`/review/${review.id}`} className="block bg-white rounded-lg border border-zinc-200 shadow-sm p-4 hover:bg-zinc-50 transition cursor-pointer">
                          <div className="font-bold text-zinc-700 mb-1">
                            {review.isAnonymous ? "anon" : (usernames[review.userId] || "User")}
                          </div>
                          <div className="flex flex-row items-center gap-4 mb-1">
                            <span className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-xl ${review.rating >= star ? '' : 'opacity-30'}`}
                                  role="img"
                                  aria-label="star"
                                >
                                  ⭐
                                </span>
                              ))}
                            </span>
                          </div>
                          <div className="text-zinc-700 truncate">{review.reviewText || "(No review text)"}</div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {visibleReviews < sortedReviews.length && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => { setVisibleReviews(sortedReviews.length); setSeeMoreClicked(true); }}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded font-semibold transition"
                    >
                      See more
                    </button>
                  </div>
                )}
                {filter.score && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setFilter({ score: null })}
                      className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded font-semibold transition"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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

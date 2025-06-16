import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import PriceSpectrum from "./PriceSpectrum";
import { colours } from "@/styles/colours";
import StarIcon from "./Icons";
import { getReviewSummary } from "@/lib/api";

const TAB_ICONS: Record<string, React.ReactNode> = {
  Price: <Image src="/pound-svgrepo-com.svg" alt="Price" width={24} height={24} className="w-6 h-6" />,
  Quality: <Image src="/quality-supervision-svgrepo-com.svg" alt="Quality" width={24} height={24} className="w-6 h-6" />,
  Nutrition: <Image src="/meal-svgrepo-com.svg" alt="Nutrition" width={24} height={24} className="w-6 h-6" />,
  Sustainability: <Image src="/leaf-svgrepo-com.svg" alt="Sustainability" width={24} height={24} className="w-6 h-6" />,
  Brand: <Image src="/prices-svgrepo-com.svg" alt="Brand" width={24} height={24} className="w-6 h-6" />,
};

interface TabbedInfoBoxProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: Product;
  reviewSummary: ReviewSummary;
  brandRating?: number;
  brandProducts?: Product[];
  priceStats?: {
        min: number;
        max: number;
        q1: number;
        median: number;
        q3: number;
  };
  maxPriceProduct?: Product | null;
  minPriceProduct?: Product | null;
}

const TabbedInfoBox: React.FC<TabbedInfoBoxProps> = ({
  activeTab,
  setActiveTab,
  product,
  reviewSummary,
  brandRating = 3,
  brandProducts = [],
  priceStats = { min: 0, max: 0, q1: 0, median: 0, q3: 0 },
  maxPriceProduct = null,
  minPriceProduct = null,
}) => {
  const tabs = useMemo(() => ["Price", "Quality", "Nutrition", "Sustainability", "Brand"], []);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [animatedBrand, setAnimatedBrand] = useState(0);
  const [animatedSustainability, setAnimatedSustainability] = useState(0);
  const [animatedNutrition, setAnimatedNutrition] = useState(0);
  const [brandReviewSummaries, setBrandReviewSummaries] = useState<Record<string, ReviewSummary>>({});

  const tabRefs = useRef([]);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0 });
  const contentRef = useRef(null);
  const [boxHeight, setBoxHeight] = useState<number | undefined>();
  const [showMinProduct, setShowMinProduct] = useState(false);
  const [showMaxProduct, setShowMaxProduct] = useState(false);
  
  // Derived state: collapsed when activeTab is empty
  const isCollapsed = activeTab === "";

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

  // Fetch review summaries for all brand products
  useEffect(() => {
    if (!brandProducts.length) return;

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
  }, [brandProducts, product.id]);

  // Calculate brand statistics from brandProducts
  const calculateBrandStats = useMemo(() => {
    if (!brandProducts.length) return null;

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
      if (averagePrice <= q1) priceScore = 5;
      else if (averagePrice >= q3) priceScore = 2;
      else priceScore = 4 - ((averagePrice - q1) / (q3 - q1)) * 2; // Scale between 2-4
    }

    // Quality statistics (based on actual review ratings from all brand products)
    const reviewRatings = allBrandProducts
      .map(p => brandReviewSummaries[p.id]?.averageRating)
      .filter(rating => rating !== undefined && rating > 0);
    
    let qualityScore = brandRating; // fallback to brandRating if no review data
    if (reviewRatings.length > 0) {
      qualityScore = reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length;
    }

    // Nutrition statistics
    const nutritionScores = allBrandProducts.map(p => getNutritionScore(p.combinedNutritionGrade || ''));
    const averageNutrition = nutritionScores.length > 0 
      ? nutritionScores.reduce((a, b) => a + b, 0) / nutritionScores.length 
      : 2;

    // Sustainability statistics
    const sustainabilityScores = allBrandProducts.map(p => p.sustainbilityScore || 3);
    const averageSustainability = sustainabilityScores.length > 0
      ? sustainabilityScores.reduce((a, b) => a + b, 0) / sustainabilityScores.length
      : 3;

    // Calculate overall brand score as average of all components
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
    };
  }, [brandProducts, product, brandRating, brandReviewSummaries]);

  // Animation trigger function
  const triggerAnimation = (tab: string) => {
    if (tab === "Quality") {
      setAnimatedQuality(0);
      setTimeout(() => setAnimatedQuality(reviewSummary?.averageRating || 0), 50);
    } else if (tab === "Brand") {
      setAnimatedBrand(0);
      setTimeout(() => setAnimatedBrand(calculateBrandStats?.overallScore || brandRating), 50);
    } else if (tab === "Sustainability") {
      setAnimatedSustainability(0);
      setTimeout(() => setAnimatedSustainability(product?.sustainbilityScore || 3), 50);
    } else if (tab === "Nutrition") {
      setAnimatedNutrition(0);
      setTimeout(() => setAnimatedNutrition(getNutritionScore(product?.combinedNutritionGrade || '')), 50);
    }
  };

  // Update sliding bar position/width on tab change or window resize
  useEffect(() => {
    const updateBar = () => {
      if (activeTab === "") {
        setBarStyle({ left: 0, width: 0 });
        return;
      }
      
      const idx = tabs.indexOf(activeTab);
      const btn = tabRefs.current[idx];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = btn.parentElement.getBoundingClientRect();
        setBarStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    };
    updateBar();
    window.addEventListener("resize", updateBar);
    return () => window.removeEventListener("resize", updateBar);
  }, [activeTab, tabs]);

  // Update box height on content change
  useEffect(() => {
    if (isCollapsed) {
      // When collapsed, only show the tabs height (no margin below)
      setBoxHeight(30); // Just the tab height without bottom margin
    } else if (contentRef.current) {
      // When expanded, calculate content height
      const newHeight = contentRef.current.scrollHeight;
      
      // Use requestAnimationFrame to ensure smooth height transition
      requestAnimationFrame(() => {
        setBoxHeight(newHeight + 50); // Add tab height
      });
    }
  }, [activeTab, product, reviewSummary, showMinProduct, showMaxProduct, isCollapsed, calculateBrandStats]);

  useEffect(() => {
    if (!isCollapsed && activeTab !== "") {
      triggerAnimation(activeTab);
    }
    // eslint-disable-next-line
  }, [activeTab, reviewSummary]);

  // Trigger animation when activeTab changes externally (e.g., from radar chart)
  useEffect(() => {
    if (activeTab !== "") {
      triggerAnimation(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const min = priceStats.min;
  const max = priceStats.max;

  // Get category background color based on active tab
  const getCategoryBackground = () => {
    if (isCollapsed || !activeTab) {
      return colours.content.surfaceSecondary;
    }
    
    const categoryMap: Record<string, string> = {
      'Price': '#fef3c7', // yellow-100
      'Quality': '#fee2e2', // red-100  
      'Nutrition': '#dbeafe', // blue-100
      'Sustainability': '#ecfccb', // lime-100
      'Brand': '#f3e8ff', // purple-100
    };
    
    return categoryMap[activeTab] || colours.content.surfaceSecondary;
  };

  return (
    <div
      className="w-full max-w-xl mt-4 rounded-2xl shadow-lg border-2 border-black p-3 transition-colors duration-300"
      style={{
        backgroundColor: getCategoryBackground(),
        border: `2px solid ${colours.content.border}`,
        height: boxHeight ? boxHeight + 32 : undefined,
        minHeight: isCollapsed ? 40 : 210,
        transition: "height 0.4s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease",
        position: "relative"
      }}
    >
      {/* Tab Headers */}
      <div 
        className={`flex ${isCollapsed ? 'mb-0' : 'mb-4'} ${!isCollapsed ? 'border-b' : ''} justify-center gap-2 relative`}
        style={{ borderColor: isCollapsed ? 'transparent' : colours.content.border }}
      >
        {/* Sliding  Bar - only show when expanded */}
        {!isCollapsed && (
          <div
            className="absolute bottom-0 h-1 rounded transition-all duration-300"
            style={{
              left: barStyle.left,
              width: barStyle.width,
              backgroundColor: '#000000',
              transition: "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        )}
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={el => { tabRefs.current[i] = el; }}
            className={`flex flex-col items-center px-2 py-1 font-semibold transition border-b-2 border-transparent`}
            style={{
              color: activeTab === tab ? colours.text.link : colours.text.secondary,
              minWidth: 44
            }}
            onClick={() => {
              if (activeTab === tab && !isCollapsed) {
                // If clicking the active tab while expanded, collapse by clearing activeTab
                setActiveTab("");
              } else {
                // If clicking a different tab or expanding from collapsed state
                setActiveTab(tab);
                triggerAnimation(tab);
              }
            }}
            aria-label={tab}
          >
            {TAB_ICONS[tab]}
          </button>
        ))}
      </div>
      {/* Content area */}
      {!isCollapsed && (
        <div 
          ref={contentRef} 
          className="relative px-4 pb-4"
          style={{ 
            opacity: 1, 
            transition: 'opacity 0.2s ease-in-out, height 0.3s ease-in-out'
          }}
        >
        {activeTab === "Price" && reviewSummary && (
          <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h2 
              className="text-lg font-bold mb-1 self-start"
              style={{ color: colours.text.primary }}
            >
              Price Range
            </h2>
            {(
              <div className="w-full opacity-0 animate-slide-in-bottom" style={{ animationDelay: '0.15s' }}>
                <PriceSpectrum 
                  product={product} 
                  priceStats={priceStats}
                  onMinClick={() => {
                    if (showMinProduct) {
                      setShowMinProduct(false);
                    } else {
                      setShowMinProduct(true);
                      setShowMaxProduct(false);
                    }
                  }}
                  onMaxClick={() => {
                    if (showMaxProduct) {
                      setShowMaxProduct(false);
                    } else {
                      setShowMaxProduct(true);
                      setShowMinProduct(false);
                    }
                  }}
                />
              </div>
            )}
            {/* Product Details Section */}
            {(showMinProduct || showMaxProduct) && (
              <div 
                className="w-full mt-12 p-4 rounded-lg opacity-0 animate-slide-in-bottom" 
                style={{ 
                  animationDelay: '0.25s',
                  backgroundColor: `${colours.content.surface}99` // 60% opacity
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-16 h-16 rounded-md shadow-sm border flex items-center justify-center"
                    style={{ 
                      backgroundColor: colours.content.surface,
                      borderColor: colours.content.border
                    }}
                  >
                    <span className="text-2xl">{showMinProduct ? '💰' : '💎'}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 
                      className="font-medium text-sm mb-1"
                      style={{ color: colours.text.primary }}
                    >
                      {showMinProduct ? 'Lowest Price Option' : 'Highest Price Option'}
                    </h3>
                    <h4 
                      className="font-semibold text-base mb-1"
                      style={{ color: colours.text.primary }}
                    >
                      {showMinProduct ? minPriceProduct?.productName : maxPriceProduct?.productName}
                    </h4>
                    <p 
                      className="text-sm mb-2"
                      style={{ color: colours.text.secondary }}
                    >
                      {showMinProduct ? minPriceProduct?.brandName : maxPriceProduct?.brandName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-medium"
                        style={{ 
                          color: showMinProduct ? colours.score.high : colours.score.low
                        }}
                      >
                        £{showMinProduct ? min.toFixed(2) : max.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          
        )}
        {activeTab === "Quality" && reviewSummary && (
          <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="w-full flex items-center gap-3 mb-4">
              <h2 
                className="text-lg font-bold mb-2 self-start"
                style={{ color: colours.text.primary }}
              >
                Reviews
              </h2>
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke={colours.score.medium}
                    strokeWidth="5"
                    strokeDasharray={Math.PI * 2 * 20}
                    strokeDashoffset={Math.PI * 2 * 20 * (1 - (animatedQuality / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">
                  <StarIcon size={24}/>
                </span>
              </span>
              <span 
                className="ml-1 text-xs"
                style={{ color: colours.text.secondary }}
              >
                Avg Score: {reviewSummary.averageRating?.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              
            </div>
            <div className="w-full">
              <div 
                className="font-semibold mb-3 text-xs md:text-base"
                style={{ color: colours.text.primary }}
              >
                Rating Distribution
              </div>
              <div className="flex items-end justify-center gap-2 h-32 w-full px-4">
                {[1,2,3,4,5].map(star => {
                  const count = Number(reviewSummary.ratingDistribution?.[star] || 0);
                  const maxCount = Math.max(...[1,2,3,4,5].map(s => Number(reviewSummary.ratingDistribution?.[s] || 0)));
                  const height = maxCount > 0 ? Math.max(8, (count / maxCount) * 100) : 8;
                  
                  return (
                    <div
                      key={star}
                      className="flex flex-col items-center group focus:outline-none"
                    >
                      <span 
                        className="text-[10px] mb-1"
                        style={{ color: colours.text.secondary }}
                      >
                        {count}
                      </span>
                      <div
                        className="rounded w-6 transition-all duration-700 animate-bar-grow"
                        style={{ 
                          height: `${height}px`, 
                          transition: 'height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease',
                          backgroundColor: colours.score.medium
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colours.score.high
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colours.score.medium
                        }}
                      />
                      <span 
                        className="text-[10px] mt-1 flex items-center"
                        style={{ color: colours.text.primary }}
                      >
                        {star}<StarIcon size={8} className="ml-0.5" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Nutrition" && product && (
          <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h2 
              className="text-lg font-bold mb-2 self-start"
              style={{ color: colours.text.primary }}
            >
              Nutrition
            </h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke={(() => {
                      const score = animatedNutrition;
                      if (score <= 2) return colours.score.low;
                      if (score <= 3) return colours.score.medium;
                      return colours.score.high;
                    })()}
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedNutrition / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span 
                    className="text-4xl font-bold"
                    style={{
                      color: (() => {
                        const score = animatedNutrition;
                        if (score <= 2) return colours.score.low;
                        if (score <= 3) return colours.score.medium;
                        return colours.score.high;
                      })()
                    }}
                  >
                    {product.combinedNutritionGrade?.toUpperCase() || '?'}
                  </span>
                </div>
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: colours.text.secondary }}
              >
                Nutrition Grade
              </span>
            </div>
          </div>
        )}
        {activeTab === "Brand" && product && (
          <div className="w-full flex flex-col opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h2 
              className="text-lg font-bold mb-4 self-start"
              style={{ color: colours.text.primary }}
            >
              Brand Performance
            </h2>
            <div className="flex items-center gap-6">
              {/* Brand Score Circle - Smaller and on the left */}
              <div className="flex flex-col items-center">
                <span className="relative inline-block w-16 h-16 align-middle">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke={colours.chart.primary}
                      strokeWidth="6"
                      strokeDasharray={Math.PI * 2 * 28}
                      strokeDashoffset={Math.PI * 2 * 28 * (1 - (animatedBrand / 5))}
                      strokeLinecap="round"
                      style={{
                        transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center center',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl">🏢</span>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: colours.text.primary }}
                    >
                      {animatedBrand}
                    </span>
                  </div>
                </span>
                <span 
                  className="text-xs font-medium mt-1 text-center"
                  style={{ color: colours.text.secondary }}
                >
                  Brand Score
                </span>
              </div>

              {/* Brand Stats Bar Graph - On the right */}
              <div className="flex-1">
                <div 
                  className="text-sm font-medium mb-3"
                  style={{ color: colours.text.primary }}
                >
                  Average Performance
                </div>
                <div className="space-y-3">
                  {calculateBrandStats ? [
                    { label: 'Price', value: calculateBrandStats.price, color: '#ECCC36' }, // colourMap.yellow for price
                    { label: 'Quality', value: calculateBrandStats.quality, color: '#D24330' }, // colourMap.red for quality
                    { label: 'Nutrition', value: calculateBrandStats.nutrition, color: '#3b82f6' }, // blue for nutrition
                    { label: 'Sustainability', value: calculateBrandStats.sustainability, color: '#309563' } // colourMap.green for sustainability
                  ].map((stat, index) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span 
                        className="text-xs font-medium w-20 text-right"
                        style={{ color: colours.text.secondary }}
                      >
                        {stat.label}
                      </span>
                      <div className="flex-1 max-w-24">
                        <div 
                          className="flex items-center h-4 rounded-full overflow-hidden"
                          style={{ backgroundColor: colours.content.surfaceSecondary }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out opacity-0 animate-fade-in"
                            style={{
                              width: `${(stat.value / 5) * 100}%`,
                              backgroundColor: stat.color,
                              animationDelay: `${0.3 + index * 0.1}s`
                            }}
                          />
                        </div>
                      </div>
                      <span 
                        className="text-xs font-medium w-8"
                        style={{ color: colours.text.primary }}
                      >
                        {stat.value.toFixed(1)}
                      </span>
                    </div>
                  )) : (
                    <div 
                      className="text-sm text-center py-4"
                      style={{ color: colours.text.secondary }}
                    >
                      Not enough brand data available
                    </div>
                  )}
                </div>
                {calculateBrandStats && (
                  <div 
                    className="text-xs mt-3 text-center"
                    style={{ color: colours.text.secondary }}
                  >
                    Based on {calculateBrandStats.productCount} products
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Sustainability" && product && (
          <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h2 
              className="text-lg font-bold mb-2 self-start"
              style={{ color: colours.text.primary }}
            >
              Sustainability
            </h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke={colours.chart.secondary}
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke={colours.score.high}
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedSustainability / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl">🌱</span>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: colours.text.primary }}
                  >
                    {animatedSustainability}
                  </span>
                </div>
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: colours.text.secondary }}
              >
                Sustainability Score
              </span>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

export default TabbedInfoBox;
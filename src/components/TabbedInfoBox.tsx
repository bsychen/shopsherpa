import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import { colours } from "@/styles/colours";
import { getReviewSummary } from "@/lib/api";
import {
  PriceTabContent,
  QualityTabContent,
  NutritionTabContent,
  SustainabilityTabContent,
  BrandTabContent
} from "./tabs";

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
  }, [brandProducts, product]);

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
      // Use the same logic as in the main page
      let sustainabilityScore = 3;
      if (product?.ecoInformation?.ecoscoreScore !== undefined) {
        sustainabilityScore = Math.max(1, Math.min(5, Math.round((product.ecoInformation.ecoscoreScore / 100) * 5)));
      } else if (product?.ecoInformation?.ecoscore && product.ecoInformation.ecoscore !== 'not-applicable') {
        const gradeScores: Record<string, number> = {
          'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1
        };
        sustainabilityScore = gradeScores[product.ecoInformation.ecoscore.toLowerCase()] || 3;
      } else {
        sustainabilityScore = product?.sustainbilityScore || 3;
      }
      setTimeout(() => setAnimatedSustainability(sustainabilityScore), 50);
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
      className="w-full max-w-xl mt-8 rounded-2xl shadow-lg border-2 border-black p-3 transition-colors duration-300"
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
            <PriceTabContent
              product={product}
              reviewSummary={reviewSummary}
              priceStats={priceStats}
              maxPriceProduct={maxPriceProduct}
              minPriceProduct={minPriceProduct}
              showMinProduct={showMinProduct}
              showMaxProduct={showMaxProduct}
              onMinProductClick={() => {
                if (showMinProduct) {
                  setShowMinProduct(false);
                } else {
                  setShowMinProduct(true);
                  setShowMaxProduct(false);
                }
              }}
              onMaxProductClick={() => {
                if (showMaxProduct) {
                  setShowMaxProduct(false);
                } else {
                  setShowMaxProduct(true);
                  setShowMinProduct(false);
                }
              }}
            />
          )}
          
          {activeTab === "Quality" && reviewSummary && (
            <QualityTabContent
              reviewSummary={reviewSummary}
              animatedQuality={animatedQuality}
            />
          )}
          
          {activeTab === "Nutrition" && product && (
            <NutritionTabContent
              product={product}
              animatedNutrition={animatedNutrition}
            />
          )}
          
          {activeTab === "Sustainability" && product && (
            <SustainabilityTabContent
              product={product}
              animatedSustainability={animatedSustainability}
            />
          )}
          
          {activeTab === "Brand" && product && (
            <BrandTabContent
              product={product}
              animatedBrand={animatedBrand}
              calculateBrandStats={calculateBrandStats}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TabbedInfoBox;
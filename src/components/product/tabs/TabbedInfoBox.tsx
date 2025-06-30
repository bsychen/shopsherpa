import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import { colours } from "@/styles/colours";
import { BrandStats } from "@/types/brand";
import {
  PriceTabContent,
  QualityTabContent,
  NutritionTabContent,
  SustainabilityTabContent,
  BrandTabContent
} from ".";
import { getNutritionScore, DEFAULT_RATING, getSustainabilityScore } from "@/utils/productScoring";

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
  brandStats?: BrandStats | null;
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
  brandStats = null,
  priceStats = { min: 0, max: 0, q1: 0, median: 0, q3: 0 },
  maxPriceProduct = null,
  minPriceProduct = null,
}) => {
  const tabs = useMemo(() => ["Price", "Quality", "Nutrition", "Sustainability", "Brand"], []);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [animatedBrand, setAnimatedBrand] = useState(0);
  const [animatedSustainability, setAnimatedSustainability] = useState(0);
  const [animatedNutrition, setAnimatedNutrition] = useState(0);

  const tabRefs = useRef([]);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0 });
  const contentRef = useRef(null);
  const [boxHeight, setBoxHeight] = useState<number | undefined>();
  const [showMinProduct, setShowMinProduct] = useState(false);
  const [showMaxProduct, setShowMaxProduct] = useState(false);
  
  /* Derived state: collapsed when activeTab is empty */
  const isCollapsed = activeTab === "";

  /* Animation trigger function */
  const triggerAnimation = useCallback((tab: string) => {
    if (tab === "Quality") {
      setAnimatedQuality(0);
      setTimeout(() => setAnimatedQuality(reviewSummary?.averageRating || 0), 50);
    } else if (tab === "Brand") {
      setAnimatedBrand(0);
      setTimeout(() => setAnimatedBrand(brandStats?.overallScore || DEFAULT_RATING), 50);
    } else if (tab === "Sustainability") {
      setAnimatedSustainability(0);
      setTimeout(() => setAnimatedSustainability(getSustainabilityScore(product)), 50);
    } else if (tab === "Nutrition") {
      setAnimatedNutrition(0);
      setTimeout(() => setAnimatedNutrition(getNutritionScore(product?.combinedNutritionGrade || '')), 50);
    }
  }, [reviewSummary?.averageRating, brandStats?.overallScore, product]);

  /* Update sliding bar position/width on tab change or window resize */
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

  /* Update box height on content change */
  useEffect(() => {
    if (isCollapsed) {
      /* When collapsed, only show the tabs height (no margin below) */
      setBoxHeight(28);
    } else if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      requestAnimationFrame(() => {
        setBoxHeight(newHeight + 40);
      });
    }
  }, [activeTab, product, reviewSummary, showMinProduct, showMaxProduct, isCollapsed, brandStats]);

  useEffect(() => {
    if (!isCollapsed && activeTab !== "") {
      triggerAnimation(activeTab);
    }
  }, [activeTab, reviewSummary, isCollapsed, triggerAnimation]);

  /* Trigger animation when activeTab changes externally (e.g., from radar chart) */
  useEffect(() => {
    if (activeTab !== "") {
      triggerAnimation(activeTab);
    }
  }, [activeTab, triggerAnimation]);

  /* Get category background color based on active tab */
  const getCategoryBackground = () => {
    if (isCollapsed || !activeTab) {
      return colours.content.surfaceSecondary;
    }
    
    const categoryMap: Record<string, string> = {
      'Price': '#fef3c7', /* yellow-100 */
      'Quality': '#fee2e2', /* red-100   */
      'Nutrition': '#dbeafe', /* blue-100 */
      'Sustainability': '#ecfccb', /* lime-100 */
      'Brand': '#f3e8ff', /* purple-100 */
    };
    
    return categoryMap[activeTab] || colours.content.surfaceSecondary;
  };

  return (
    <div
      className="w-full max-w-xl mt-8 rounded-2xl shadow-lg border-2 border-black p-2 transition-colors duration-300"
      style={{
        backgroundColor: getCategoryBackground(),
        border: `2px solid ${colours.content.border}`,
        height: boxHeight ? boxHeight + 24 : undefined,
        minHeight: isCollapsed ? 36 : 260,
        transition: "height 0.4s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease",
        position: "relative"
      }}
    >
      {/* Tab Headers */}
      <div 
        className={`flex ${isCollapsed ? 'mb-0' : 'mb-2'} ${!isCollapsed ? 'border-b' : ''} justify-center gap-2 relative`}
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
                /* If clicking the active tab while expanded, collapse by clearing activeTab */
                setActiveTab("");
              } else {
                /* If clicking a different tab or expanding from collapsed state */
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
          className="relative px-3 pb-3"
          style={{ 
            opacity: 1, 
            transition: 'opacity 0.2s ease-in-out, height 0.3s ease-in-out'
          }}
        >
          {activeTab === "Price" && (
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
              calculateBrandStats={brandStats}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TabbedInfoBox;
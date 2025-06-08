import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import PriceSpectrum from "./PriceSpectrum";

const TAB_ICONS: Record<string, React.ReactNode> = {
  Price: <Image src="/pound-svgrepo-com.svg" alt="Price" width={24} height={24} className="w-6 h-6" />,
  Quality: <Image src="/quality-supervision-svgrepo-com.svg" alt="Quality" width={24} height={24} className="w-6 h-6" />,
  Nutrition: <Image src="/meal-svgrepo-com.svg" alt="Nutrition" width={24} height={24} className="w-6 h-6" />,
  Sustainability: <Image src="/leaf-svgrepo-com.svg" alt="Sustainability" width={24} height={24} className="w-6 h-6" />,
  Brand: <Image src="/prices-svgrepo-com.svg" alt="Brand" width={24} height={24} className="w-6 h-6" />,
};

const TAB_BG_COLORS: Record<string, string> = {
  Price: "bg-yellow-50",
  Quality: "bg-red-50",
  Nutrition: "bg-blue-50",
  Sustainability: "bg-lime-50",
  Brand: "bg-purple-50",
};

interface TabbedInfoBoxProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: Product;
  reviewSummary: ReviewSummary;
  brandRating?: number;
  similarProducts?: Product[];
}

const TabbedInfoBox: React.FC<TabbedInfoBoxProps> = ({
  activeTab,
  setActiveTab,
  product,
  reviewSummary,
  brandRating = 3,
  similarProducts = [],
}) => {
  const tabs = useMemo(() => ["Price", "Quality", "Nutrition", "Sustainability", "Brand"], []);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [animatedBrand, setAnimatedBrand] = useState(0);
  const [animatedSustainability, setAnimatedSustainability] = useState(0);
  const [animatedNutrition, setAnimatedNutrition] = useState(0);

  const tabRefs = useRef([]);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0 });
  const contentRef = useRef(null);
  const [boxHeight, setBoxHeight] = useState();
  const [showMinProduct, setShowMinProduct] = useState(false);
  const [showMaxProduct, setShowMaxProduct] = useState(false);

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

  // Animation trigger function
  const triggerAnimation = (tab) => {
    if (tab === "Price") {
      setAnimatedValue(0);
      setTimeout(() => setAnimatedValue(reviewSummary?.averageValueRating || 0), 50);
    } else if (tab === "Quality") {
      setAnimatedQuality(0);
      setTimeout(() => setAnimatedQuality(reviewSummary?.averageQualityRating || 0), 50);
    } else if (tab === "Brand") {
      setAnimatedBrand(0);
      setTimeout(() => setAnimatedBrand(brandRating), 50);
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
    // Update the height calculation to better handle product details
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      
      // Use requestAnimationFrame to ensure smooth height transition
      requestAnimationFrame(() => {
        setBoxHeight(newHeight);
      });
    }
  }, [activeTab, product, reviewSummary, showMinProduct, showMaxProduct]);

  useEffect(() => {
    triggerAnimation(activeTab);
    // eslint-disable-next-line
  }, [activeTab, reviewSummary]);

  const minPriceProduct = similarProducts.reduce((min, p) => p.price < min.price ? p : min, similarProducts[0]);
  const maxPriceProduct = similarProducts.reduce((max, p) => p.price > max.price ? p : max, similarProducts[0]);
  const min = minPriceProduct ? minPriceProduct.price : 0;
  const max = maxPriceProduct ? maxPriceProduct.price : 0;

  return (
    <div
      className={`w-full max-w-xl mt-4 border border-zinc-200 rounded-xl shadow p-4 transition-colors duration-300 ${TAB_BG_COLORS[activeTab]}`}
      style={{
        height: boxHeight ? boxHeight + 90 : undefined,
        minHeight: 210,
        transition: "height 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        position: "relative"
      }}
    >
      {/* Tab Headers */}
      <div className="flex mb-4 border-b border-zinc-100 justify-center gap-2 relative">
        {/* Sliding Grey Bar */}
        <div
          className="absolute bottom-0 h-1 bg-zinc-300 rounded transition-all duration-300"
          style={{
            left: barStyle.left,
            width: barStyle.width,
            transition: "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={el => { tabRefs.current[i] = el; }}
            className={`flex flex-col items-center px-2 py-1 font-semibold transition border-b-2 ${activeTab === tab ? "border-transparent text-blue-700" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
            onClick={() => {
              setActiveTab(tab);
              triggerAnimation(tab);
            }}
            style={{ minWidth: 44 }}
            aria-label={tab}
          >
            {TAB_ICONS[tab]}
          </button>
        ))}
      </div>
      {/* Content area */}
      <div 
        ref={contentRef} 
        className="relative px-4 pb-4"
        style={{ 
          opacity: 1, 
          transition: 'opacity 0.2s ease-in-out, height 0.3s ease-in-out'
        }}
      >
        {activeTab === "Price" && reviewSummary && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Price Range</h2>
            {similarProducts.length > 0 && (
              <PriceSpectrum 
                product={product} 
                similarProducts={similarProducts} 
                onMinClick={() => {
                  // Toggle min product view and ensure max is hidden when min is shown
                  if (showMinProduct) {
                    setShowMinProduct(false);
                  } else {
                    setShowMinProduct(true);
                    setShowMaxProduct(false);
                  }
                }}
                onMaxClick={() => {
                  // Toggle max product view and ensure min is hidden when max is shown
                  if (showMaxProduct) {
                    setShowMaxProduct(false);
                  } else {
                    setShowMaxProduct(true);
                    setShowMinProduct(false);
                  }
                }}
                min={min}
                max={max}
              />
            )}
            {/* Product Details Section */}
            {(showMinProduct || showMaxProduct) && (
              <div className="w-full mt-12 p-4 rounded-lg bg-white/60 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-white rounded-md shadow-sm border border-zinc-200 flex items-center justify-center">
                    <span className="text-2xl">{showMinProduct ? '💰' : '💎'}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-sm mb-1">
                      {showMinProduct ? 'Lowest Price Option' : 'Highest Price Option'}
                    </h3>
                    <h4 className="font-semibold text-base mb-1">
                      {showMinProduct ? minPriceProduct?.productName : maxPriceProduct?.productName}
                    </h4>
                    <p className="text-sm text-zinc-600 mb-2">
                      {showMinProduct ? minPriceProduct?.brandName : maxPriceProduct?.brandName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${showMinProduct ? 'text-green-600' : 'text-red-600'}`}>
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
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Quality</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="#f87171"
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
                <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">🍎</span>
              </span>
              <span className="ml-1 text-xs text-zinc-500">Avg Score: {reviewSummary.averageQualityRating?.toFixed(2)}</span>
            </div>
            <div className="w-full">
              <div className="font-semibold mb-1 text-xs md:text-base">Quality</div>
              <div className="flex flex-col gap-1 h-auto w-full">
                {[5,4,3,2,1].map(star => (
                  <div
                    key={star}
                    className="flex items-center mb-0.5 w-full group focus:outline-none"
                  >
                    <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                    <div
                      className="bg-red-400 rounded h-3 transition-all duration-700 animate-bar-grow group-hover:bg-red-500"
                      style={{ width: `${Math.max(6, Number(reviewSummary.qualityDistribution?.[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.qualityDistribution?.[star] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Nutrition" && product && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Nutrition</h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke={(() => {
                      const score = animatedNutrition;
                      if (score <= 2) return '#ef4444'; // red-500
                      if (score <= 3) return '#f59e0b'; // amber-500
                      return '#22c55e'; // green-500
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
                        if (score <= 2) return '#ef4444'; // red-500
                        if (score <= 3) return '#f59e0b'; // amber-500
                        return '#22c55e'; // green-500
                      })()
                    }}
                  >
                    {product.combinedNutritionGrade?.toUpperCase() || '?'}
                  </span>
                </div>
              </span>
              <span className="text-sm text-zinc-600 font-medium">Nutrition Grade</span>
            </div>
          </div>
        )}
        {activeTab === "Brand" && product && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Brand</h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedBrand / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl">🏢</span>
                  <span className="text-2xl font-bold text-zinc-800">{animatedBrand}</span>
                </div>
              </span>
              <span className="text-sm text-zinc-600 font-medium">{product.brandName || 'Unknown'}</span>
            </div>
          </div>
        )}
        {activeTab === "Sustainability" && product && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Sustainability</h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="#86efac"
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
                    stroke="#22c55e"
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
                  <span className="text-2xl font-bold text-zinc-800">{animatedSustainability}</span>
                </div>
              </span>
              <span className="text-sm text-zinc-600 font-medium">Sustainability Score</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabbedInfoBox;
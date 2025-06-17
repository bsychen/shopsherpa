import React from "react";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";

interface BrandStats {
  price: number;
  quality: number;
  nutrition: number;
  sustainability: number;
  overallScore: number;
  productCount: number;
}

interface BrandTabContentProps {
  product: Product;
  animatedBrand: number;
  calculateBrandStats: BrandStats | null;
}

const BrandTabContent: React.FC<BrandTabContentProps> = ({
  product,
  animatedBrand,
  calculateBrandStats,
}) => {
  return (
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in px-1" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Brand Performance
      </h2>
      {/* Brand Score Card */}
      <div 
        className="w-full p-3 sm:p-4 rounded-xl border-2 mb-4"
        style={{ 
          backgroundColor: '#f1f5fb', // baby blue
          borderColor: colours.content.border
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <span 
              className="text-lg font-medium"
              style={{ color: colours.text.primary }}
            >
              Brand Score
            </span>
            <span 
              className="text-[10px]"
              style={{ color: colours.text.muted }}
            >
              Overall brand performance rating
            </span>
          </div>
          <div className="flex-shrink-0">
            <div 
              className="relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: (() => {
                  const score = animatedBrand;
                  if (score <= 2) return colours.score.low;
                  if (score <= 3) return colours.score.medium;
                  return colours.score.high;
                })(),
                backgroundColor: (() => {
                  const score = animatedBrand;
                  if (score <= 2) return colours.score.low + '20'; // 20% opacity
                  if (score <= 3) return colours.score.medium + '20';
                  return colours.score.high + '20';
                })(),
              }}
            >
              <span className="relative inline-block w-16 h-16 align-middle">
                <svg width="64" height="64" viewBox="0 0 64 64" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="32" cy="32" r="24"
                    fill="none"
                    stroke={(() => {
                      const score = animatedBrand;
                      if (score <= 2) return colours.score.low;
                      if (score <= 3) return colours.score.medium;
                      return colours.score.high;
                    })()}
                    strokeWidth="4"
                    strokeDasharray={Math.PI * 2 * 24}
                    strokeDashoffset={Math.PI * 2 * 24 * (1 - (animatedBrand / 5))}
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
                    className="text-lg font-bold"
                    style={{
                      color: (() => {
                        const score = animatedBrand;
                        if (score <= 2) return colours.score.low;
                        if (score <= 3) return colours.score.medium;
                        return colours.score.high;
                      })()
                    }}
                  >
                    {animatedBrand}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Performance Card */}
      <div 
        className="w-full p-3 sm:p-4 rounded-xl border-2"
        style={{ 
          backgroundColor: '#f1f5fb', // baby blue
          borderColor: colours.content.border
        }}
      >
        <div className="w-full min-w-0">
          <div className="flex items-baseline gap-2 mb-3">
            <span 
              className="text-lg font-medium"
              style={{ color: colours.text.primary }}
            >
              Performance Metrics
            </span>
          </div>
          {calculateBrandStats ? (
            <div className="w-full">
              <div className="space-y-3">
                {[
                  { label: 'Price', value: calculateBrandStats.price, color: '#ECCC36' },
                  { label: 'Quality', value: calculateBrandStats.quality, color: '#D24330' },
                  { label: 'Nutrition', value: calculateBrandStats.nutrition, color: '#3b82f6' },
                  { label: 'Sustainability', value: calculateBrandStats.sustainability, color: '#309563' }
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
                ))}
              </div>
              <div 
                className="text-xs mt-3 text-center"
                style={{ color: colours.text.secondary }}
              >
                Based on {calculateBrandStats.productCount} products
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-center py-4"
              style={{ color: colours.text.secondary }}
            >
              Not enough brand data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandTabContent;

import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";
import { BrandStats } from "@/types/brand";

interface BrandTabContentProps {
  product: Product;
  animatedBrand: number;
  calculateBrandStats: BrandStats | null;
}

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score <= 2) return colours.score.low;
  if (score <= 3) return colours.score.medium;
  return colours.score.high;
};

// Helper function to get background color with opacity
const getScoreBackgroundColor = (score: number): string => {
  return getScoreColor(score) + '20'; // 20% opacity
};

// Performance metrics configuration
const PERFORMANCE_METRICS = [
  { 
    label: 'Price', 
    color: '#fef3c7', /* yellow-100 */
    svg: '/pound-svgrepo-com.svg' 
  },
  { 
    label: 'Quality', 
    color: '#fee2e2', /* red-100 */
    svg: '/quality-supervision-svgrepo-com.svg' 
  },
  { 
    label: 'Nutrition', 
    color: '#dbeafe', /* blue-100 */
    svg: '/meal-svgrepo-com.svg' 
  },
  { 
    label: 'Sustainability', 
    color: '#ecfccb', /* lime-100 */
    svg: '/leaf-svgrepo-com.svg' 
  }
];

const BrandTabContent: React.FC<BrandTabContentProps> = ({
  animatedBrand,
  calculateBrandStats,
}) => {
  const strokeColor = getScoreColor(animatedBrand);
  const backgroundColor = getScoreBackgroundColor(animatedBrand);

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
          backgroundColor: '#f1f5fb', /* baby blue */
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
              className="relative w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: strokeColor,
                backgroundColor: backgroundColor,
              }}
            >
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="18"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeDasharray={Math.PI * 2 * 18}
                    strokeDashoffset={Math.PI * 2 * 18 * (1 - (animatedBrand / 5))}
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
                    className="text-xl font-bold"
                    style={{ color: strokeColor }}
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
          backgroundColor: '#f1f5fb',
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
                {PERFORMANCE_METRICS.map((metric, index) => {
                  const value = calculateBrandStats[metric.label.toLowerCase() as keyof BrandStats] as number;
                  const percentage = ((value - 1) / 4) * 100;
                  
                  return (
                    <div key={metric.label} className="flex items-center gap-3">
                      <Image 
                        src={metric.svg} 
                        alt={metric.label} 
                        width={16} 
                        height={16} 
                        className="flex-shrink-0"
                        style={{ color: colours.text.secondary }}
                      />
                      <div className="flex-1">
                        <div 
                          className="relative rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: colours.bargraph.background,
                            border: `2px dotted ${colours.card.border}30`,
                            height: '28px',
                          }}
                        >
                          <div 
                            className="transition-all duration-1000 ease-out absolute inset-0 rounded-lg opacity-0 animate-fade-in"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: metric.color,
                              border: `2px solid ${colours.card.border}`,
                              animationDelay: `${0.3 + index * 0.1}s`
                            }}
                          />
                        </div>
                      </div>
                      <span 
                        className="text-xs font-medium w-8 text-right flex-shrink-0"
                        style={{ color: colours.text.primary }}
                      >
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
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

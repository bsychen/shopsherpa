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
  );
};

export default BrandTabContent;

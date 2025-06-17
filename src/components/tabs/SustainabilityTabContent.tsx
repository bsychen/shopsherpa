import React from "react";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";

interface SustainabilityTabContentProps {
  product: Product;
  animatedSustainability: number;
}

const SustainabilityTabContent: React.FC<SustainabilityTabContentProps> = ({
  product,
  animatedSustainability,
}) => {
  return (
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in px-1" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Sustainability
      </h2>
      {/* Sustainability Score Card */}
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
              Sustainability Score
            </span>
            <span 
              className="text-[10px]"
              style={{ color: colours.text.muted }}
            >
              Environmental impact rating
            </span>
          </div>
          <div className="flex-shrink-0">
            <div 
              className="relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: (() => {
                  const score = animatedSustainability;
                  if (score <= 2) return colours.score.low;
                  if (score <= 3) return colours.score.medium;
                  return colours.score.high;
                })(),
                backgroundColor: (() => {
                  const score = animatedSustainability;
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
                      const score = animatedSustainability;
                      if (score <= 2) return colours.score.low;
                      if (score <= 3) return colours.score.medium;
                      return colours.score.high;
                    })()}
                    strokeWidth="4"
                    strokeDasharray={Math.PI * 2 * 24}
                    strokeDashoffset={Math.PI * 2 * 24 * (1 - (animatedSustainability / 5))}
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
                        const score = animatedSustainability;
                        if (score <= 2) return colours.score.low;
                        if (score <= 3) return colours.score.medium;
                        return colours.score.high;
                      })()
                    }}
                  >
                    {animatedSustainability}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact Card */}
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
              Environmental Impact
            </span>
          </div>
          {product.ecoInformation ? (
            <div className="w-full">
              <div className="space-y-3 w-full">
              {/* Eco Score */}
              {(product.ecoInformation.ecoscore || product.ecoInformation.ecoscoreScore !== undefined) && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌍</span>
                    <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Eco Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.ecoInformation.ecoscore && (
                      <span 
                        className="text-lg font-bold px-2 py-1 rounded"
                        style={{ 
                          color: colours.text.primary,
                          backgroundColor: product.ecoInformation.ecoscore === 'a' ? colours.score.high :
                                          product.ecoInformation.ecoscore === 'b' ? colours.score.medium :
                                          product.ecoInformation.ecoscore === 'c' ? colours.score.medium :
                                          colours.score.low
                        }}
                      >
                        {product.ecoInformation.ecoscore.toUpperCase()}
                      </span>
                    )}
                    {product.ecoInformation.ecoscoreScore !== undefined && (
                      <span className="text-sm font-bold" style={{ color: colours.text.primary }}>
                        {product.ecoInformation.ecoscoreScore}/100
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Packaging Information */}
              {product.ecoInformation.packagingInfo && product.ecoInformation.packagingInfo.length > 0 && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📦</span>
                    <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Packaging</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.ecoInformation.packagingInfo.slice(0, 5).map((item, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: colours.tag.default.background,
                          color: colours.tag.default.text,
                          fontSize: '10px'
                        }}
                      >
                        {item.replace(/^en:/, '').replace(/-/g, ' ')}
                      </span>
                    ))}
                    {product.ecoInformation.packagingInfo.length > 5 && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: colours.tag.default.background,
                          color: colours.tag.default.text,
                          fontSize: '10px'
                        }}
                      >
                        +{product.ecoInformation.packagingInfo.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-center py-4"
              style={{ color: colours.text.secondary }}
            >
              No environmental information available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityTabContent;

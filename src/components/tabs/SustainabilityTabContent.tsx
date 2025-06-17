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
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Sustainability
      </h2>
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        {/* Sustainability Score Circle */}
        <div className="flex flex-col items-center gap-2">
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

        {/* Eco Information */}
        {product.ecoInformation && (
          <div className="w-full mt-4">
            <h3 
              className="text-md font-semibold mb-3 text-center"
              style={{ color: colours.text.primary }}
            >
              Environmental Impact
            </h3>
            <div className="space-y-3 w-full max-w-sm mx-auto">
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
        )}
      </div>
    </div>
  );
};

export default SustainabilityTabContent;

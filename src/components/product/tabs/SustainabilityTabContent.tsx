import React from "react";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";

interface SustainabilityTabContentProps {
  product: Product;
  animatedSustainability: number;
}

/* Helper function to get color based on ecoscore */
const getEcoscoreColor = (ecoscore: string | undefined): string => {
  if (!ecoscore || ecoscore === 'not-applicable' || ecoscore === 'unknown') {
    return colours.text.muted;
  }
  if (ecoscore === 'f' || ecoscore === 'e' || ecoscore === 'd') {
    return colours.score.low;
  }
  if (ecoscore === 'c') {
    return colours.score.medium;
  }
  return colours.score.high; // a, b grades
};

/* Helper function to get background color with opacity */
const getEcoscoreBackgroundColor = (ecoscore: string | undefined): string => {
  return getEcoscoreColor(ecoscore) + '20'; // 20% opacity
};

// Helper function to format ecoscore display
const formatEcoscoreDisplay = (ecoscore: string | undefined): string => {
  if (!ecoscore || ecoscore === 'not-applicable' || ecoscore === 'unknown') {
    return '--';
  }
  return ecoscore.replace('-plus', '+').toUpperCase();
};

const SustainabilityTabContent: React.FC<SustainabilityTabContentProps> = ({
  product,
  animatedSustainability,
}) => {
  const ecoscore = product.ecoInformation?.ecoscore;
  const strokeColor = getEcoscoreColor(ecoscore);
  const backgroundColor = getEcoscoreBackgroundColor(ecoscore);
  const scorePercentage = animatedSustainability / 5; // Use animated value for ring animation
  const displayScore = formatEcoscoreDisplay(ecoscore);

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
              Eco Score
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
                    strokeDashoffset={Math.PI * 2 * 18 * (1 - scorePercentage)}
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
                    {displayScore}
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
          backgroundColor: '#f1f5fb', /* baby blue */
          borderColor: colours.content.border
        }}
      >
        <div className="w-full min-w-0">
          <div className="flex items-baseline gap-2 mb-3">
            <span 
              className="text-lg font-medium"
              style={{ color: colours.text.primary }}
            >
              Packaging Info
            </span>
          </div>
          {product.ecoInformation?.packagingInfo?.length ? (
            <div className="w-full">
              <div className="flex flex-wrap gap-1.5 pb-2 break-words">
                {product.ecoInformation.packagingInfo.slice(0, 8).map((item, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: colours.text.primary,
                      borderColor: colours.content.border + 'CC' /* 80% opacity */
                    }}
                  >
                    {item.replace(/^en:/, '').replace(/-/g, ' ').replace(/_/g, ' ')}
                  </span>
                ))}
                {product.ecoInformation.packagingInfo.length > 8 && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: colours.text.primary,
                      borderColor: colours.content.border + 'CC' /* 80% opacity */
                    }}
                  >
                    +{product.ecoInformation.packagingInfo.length - 8} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-center py-4"
              style={{ color: colours.text.secondary }}
            >
              No packaging information available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityTabContent;

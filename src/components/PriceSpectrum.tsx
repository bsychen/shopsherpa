import React from 'react';
import { Product } from '@/types/product';
import { colours } from '@/styles/colours';

// Helper function to get color based on position
const getPositionColor = (price: number, q1: number, q3: number) => {
  if (price <= q1) {
    return {
      bg: colours.status.success.background,
      border: colours.status.success.border,
      text: colours.status.success.text
    };
  } else if (price >= q3) {
    return {
      bg: colours.status.error.background,
      border: colours.status.error.border,
      text: colours.status.error.text
    };
  } else {
    return {
      bg: colours.status.warning.background,
      border: colours.status.warning.border,
      text: colours.status.warning.text
    };
  }
};

interface PriceSpectrumProps {
  product: Product;
  priceStats: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  onMinClick?: () => void;
  onMaxClick?: () => void;
  min?: number;
  max?: number;
}

const PriceSpectrum: React.FC<PriceSpectrumProps> = ({ 
  product, 
  priceStats,
  onMinClick,
  onMaxClick,
}) => {

  // Calculate the statistics for the boxplot
  const getPrice = (p: Product) => p.price || p.expectedPrice || 0;
  const productPrice = getPrice(product);

  // If no real prices available, use sample data
  if (productPrice === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center text-sm rounded-lg" style={{ 
        color: colours.text.muted, 
        backgroundColor: colours.background.secondary,
        border: `1px solid ${colours.card.border}`
      }}>
        Price data unavailable
      </div>
    );
  }

  // Convert prices to position percentages for visualization, accounting for 5% padding on each side
  const scale = (price: number) => {
    if (price === priceStats.min) return 5; // Align with left edge of spectrum
    if (price === priceStats.max) return 95; // Align with right edge of spectrum
    // Scale between 5% and 95% for other values
    return 5 + ((price - priceStats.min) / (priceStats.max - priceStats.min)) * 90;
  };

  console.log('Price Spectrum:', {
    productPrice,
    priceStats,
    scaledPrice: scale(productPrice),
  });

  // Calculate the position of the current product's price
  const currentPosition = scale(productPrice);
  const colors = getPositionColor(productPrice, priceStats.q1, priceStats.q3);

  return (
    <div className="w-full mb-4">
      <div className="relative w-full h-24">
        {/* Main horizontal line - Split into three segments */}
        <div className="absolute h-1.5 flex top-[75%] left-[5%] right-[5%] -translate-y-1/2">
          <div 
            className="h-full rounded-l-full"
            style={{ 
              width: `${scale(priceStats.q1)}%`,
              backgroundColor: colours.status.success.icon
            }}
          />
          <div 
            className="h-full"
            style={{ 
              width: `${scale(priceStats.q3) - scale(priceStats.q1)}%`,
              backgroundColor: colours.score.medium // Yellow for median quartile
            }}
          />
          <div 
            className="h-full rounded-r-full"
            style={{ 
              width: `${100 - scale(priceStats.q3)}%`,
              backgroundColor: colours.score.low // Red for upper quartile
            }}
          />
        </div>
        
        {/* Median line */}
        <div 
          className="absolute h-1 w-0.5 z-[2]"
          style={{
            top: '75%',
            left: `${scale(priceStats.median)}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: colours.score.medium // Yellow for median line
          }}
        />
        
        {/* Current product marker */}
        <div 
          className="absolute flex flex-col items-center z-20 animate-slide-in-pointer"
          style={{
            top: '28px', 
            left: `${currentPosition}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Product box with shadow and border */}
          <div className="rounded-md shadow-sm px-2 py-1 mb-1" style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`
          }}>
            <div className="text-xs font-medium whitespace-nowrap" style={{ color: colors.text }}>
              £{productPrice.toFixed(2)}
            </div>
          </div>
          {/* Triangle pointer */}
          <div 
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
            style={{ borderTopColor: colors.border }}
          />
        </div>          
        {/* Price labels with buttons */}
        <div className="absolute -bottom-6 left-[0%]">
          <button 
            className="rounded-md shadow-sm px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: colours.status.success.background,
              border: `1px solid ${colours.status.success.border}`,
              color: colours.status.success.text
            }}
            onClick={onMinClick}
          >
            £{priceStats.min.toFixed(2)}
          </button>
        </div>
        <div className="absolute -bottom-6 right-[0%]">
          <button 
            className="rounded-md shadow-sm px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: colours.status.error.background,
              border: `1px solid ${colours.status.error.border}`,
              color: colours.status.error.text
            }}
            onClick={onMaxClick}
          >
            £{priceStats.max.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSpectrum;

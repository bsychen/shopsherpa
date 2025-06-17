import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { colours } from '@/styles/colours';

// Helper function to get color based on position
const getPositionColor = (price: number, q1: number, q3: number) => {
  if (price <= q1) {
    return {
      bg: `${colours.status.success.border}80`, // Green with transparency
      border: colours.status.success.border,
      text: colours.button.success.text
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
  const [animatePointer, setAnimatePointer] = useState(false);

  // Trigger animation when component mounts or product changes
  useEffect(() => {
    setAnimatePointer(false);
    const timer = setTimeout(() => {
      setAnimatePointer(true);
    }, 100); // Small delay to ensure clean animation start

    return () => clearTimeout(timer);
  }, [product.id]); // Re-animate when product changes

  // Calculate the statistics for the boxplot
  const getPrice = (p: Product) => p.price || p.expectedPrice || 0;
  const productPrice = getPrice(product);

  // If no real prices available, show simple message
  if (productPrice === 0 && priceStats.min === 0 && priceStats.max === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center text-sm" style={{ 
        color: colours.text.secondary
      }}>
        Price data unavailable
      </div>
    );
  }

  // If current product has no price but we have price statistics, show different message
  if (productPrice === 0 && (priceStats.min > 0 || priceStats.max > 0)) {
    return (
      <div className="w-full h-24 flex flex-col items-center justify-center text-sm" style={{ 
        color: colours.text.secondary
      }}>
        <div>Price not available for this product</div>
        <div className="mt-1 text-xs">
          Similar products range: £{priceStats.min.toFixed(2)} - £{priceStats.max.toFixed(2)}
        </div>
      </div>
    );
  }

  // Ensure we have valid price range for scaling
  const minPrice = Math.max(priceStats.min, 0.01); // Avoid division by zero
  const maxPrice = Math.max(priceStats.max, productPrice, 0.01);

  // Convert prices to position percentages for visualization, accounting for 5% padding on each side
  const scale = (price: number) => {
    if (price === minPrice) return 5; // Align with left edge of spectrum
    if (price === maxPrice) return 95; // Align with right edge of spectrum
    // Scale between 5% and 95% for other values
    const range = maxPrice - minPrice;
    if (range === 0) return 50; // If all prices are the same, center it
    return 5 + ((price - minPrice) / range) * 90;
  };

  // Calculate the position of the current product's price
  const currentPosition = scale(productPrice);
  const colors = getPositionColor(productPrice, priceStats.q1, priceStats.q3);

  return (
    <div className="w-full mb-2">
      <div className="relative w-full h-16">
        {/* Main horizontal line - Split into three segments */}
        <div className="absolute h-1.5 flex top-[60%] left-[5%] right-[5%] -translate-y-1/2">
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
            top: '60%',
            left: `${scale(priceStats.median)}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: colours.score.medium // Yellow for median line
          }}
        />
        
        {/* Current product marker */}
        <div 
          className={`absolute flex flex-col items-center z-20 ${animatePointer ? 'animate-slide-in-pointer-from-center' : 'opacity-0'}`}
          style={{
            top: '-5%', 
            left: animatePointer ? `${currentPosition}%` : '50%',
            transform: 'translateX(-50%)',
            '--final-position': `${currentPosition}%`
          } as React.CSSProperties & { '--final-position': string }}
        >
          {/* Product box with shadow and border */}
          <div className="rounded-full shadow-lg px-2 py-1 mb-1 border-2 border-black" style={{
            backgroundColor: colors.bg,
            borderColor: colors.border
          }}>
            <div className="text-xs font-medium whitespace-nowrap" style={{ color: colors.text }}>
              £{productPrice.toFixed(2)}
            </div>
          </div>
          {/* Triangle pointer */}
          <div 
            className="w-0 h-0 border-l-[5px] shadow-lg border-l-transparent border-r-[5px] border-r-transparent border-t-[5px]"
            style={{ borderTopColor: colors.border }}
          />
        </div>          
        {/* Price labels with buttons */}
        <div className="absolute -bottom-4 left-[0%]">
          <button 
            className="rounded-full shadow-lg px-2 py-1 text-xs font-medium transition-colors border-2 border-dotted"
            style={{
              backgroundColor: `${colours.status.success.border}50`, // 30% opacity for transparency
              borderColor: colours.status.success.border,
              color: colours.button.success.text
            }}
            onClick={onMinClick}
          >
            £{minPrice.toFixed(2)}
          </button>
        </div>
        <div className="absolute -bottom-4 right-[0%]">
          <button 
            className="rounded-full shadow-lg px-2 py-1 text-xs font-medium transition-colors border-2 border-dotted"
            style={{
              backgroundColor: `${colours.status.error.background}50`, // 30% opacity for transparency
              borderColor: colours.status.error.border,
              color: colours.status.error.text
            }}
            onClick={onMaxClick}
          >
            £{maxPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSpectrum;

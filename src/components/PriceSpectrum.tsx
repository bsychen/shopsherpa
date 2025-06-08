import React from 'react';
import { Product } from '@/types/product';

// Helper function to get color based on position
const getPositionColor = (price: number, q1: number, q3: number) => {
  if (price <= q1) {
    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600'
    };
  } else if (price >= q3) {
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600'
    };
  } else {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-600'
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
      <div className="w-full h-24 flex items-center justify-center text-zinc-500 text-sm bg-zinc-50 rounded-lg border border-zinc-200">
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
            className="h-full bg-green-400 rounded-l-full"
            style={{ width: `${scale(priceStats.q1)}%` }}
          />
          <div 
            className="h-full bg-amber-400"
            style={{ width: `${scale(priceStats.q3) - scale(priceStats.q1)}%` }}
          />
          <div 
            className="h-full bg-red-400 rounded-r-full"
            style={{ width: `${100 - scale(priceStats.q3)}%` }}
          />
        </div>
        
        {/* Median line */}
        <div 
          className="absolute h-5 w-0.5 bg-black/20 z-[2]"
          style={{
            top: '75%',
            left: `${scale(priceStats.median)}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Current product marker */}
        <div 
          className="absolute flex flex-col items-center z-20 animate-slide-in-pointer"
          style={{
            top: '8px',
            left: `${currentPosition}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Product box with shadow and border */}
          <div className={`${colors.bg} rounded-md shadow-sm ${colors.border} px-2 py-1 mb-1`}>
            <div className={`text-xs font-medium ${colors.text} whitespace-nowrap`}>
              £{productPrice.toFixed(2)}
            </div>
          </div>
          {/* Triangle pointer */}
          <div 
            className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${colors.border}`}
          />
        </div>          
        {/* Price labels with buttons */}
        <div className="absolute -bottom-6 left-[0%]">
          <button 
            className="bg-green-50 rounded-md shadow-sm border border-green-200 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
            onClick={onMinClick}
          >
            £{priceStats.min.toFixed(2)}
          </button>
        </div>
        <div className="absolute -bottom-6 right-[0%]">
          <button 
            className="bg-red-50 rounded-md shadow-sm border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
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

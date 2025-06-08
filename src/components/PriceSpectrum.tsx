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

// Helper function to calculate quartiles
const calculateQuartile = (arr: number[], q: number) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

interface PriceSpectrumProps {
  product: Product;
  similarProducts: Product[];
  onMinClick?: () => void;
  onMaxClick?: () => void;
  min?: number;
  max?: number;
}

const PriceSpectrum: React.FC<PriceSpectrumProps> = ({ 
  product, 
  similarProducts, 
  onMinClick,
  onMaxClick,
  min: externalMin,
  max: externalMax
}) => {

  // Calculate the statistics for the boxplot
  const getPrice = (p: Product) => p.price || p.expectedPrice || 0;
  const prices = similarProducts.map(getPrice).filter(p => p > 0);
  const productPrice = getPrice(product);

  // If no real prices available, use sample data
  if (!prices.length || productPrice === 0) {
    return (
      <div className="w-full h-24 flex items-center justify-center text-zinc-500 text-sm bg-zinc-50 rounded-lg border border-zinc-200">
        Price data unavailable
      </div>
    );
  }

  // Sort prices for calculations
  prices.sort((a, b) => a - b);
  
  // Calculate quartiles using proper quartile calculation
  const min = externalMin ?? Math.min(...prices);
  const max = externalMax ?? Math.max(...prices);
  const q1 = calculateQuartile(prices, 0.25);
  const median = calculateQuartile(prices, 0.5);
  const q3 = calculateQuartile(prices, 0.75);
  
  // Convert prices to position percentages for visualization
  const scale = (price: number) => ((price - min) / (max - min)) * 100;

  // Calculate the position of the current product's price
  const currentPosition = scale(productPrice);
  const colors = getPositionColor(productPrice, q1, q3);

  return (
    <div className="w-full mb-4">
      <div className="relative w-full h-24">
        {/* Main horizontal line - Split into three segments */}
        <div className="absolute h-1.5 flex top-[75%] left-[5%] right-[5%] -translate-y-1/2">
          <div 
            className="h-full bg-green-400 rounded-l-full"
            style={{ width: `${scale(q1)}%` }}
          />
          <div 
            className="h-full bg-amber-400"
            style={{ width: `${scale(q3) - scale(q1)}%` }}
          />
          <div 
            className="h-full bg-red-400 rounded-r-full"
            style={{ width: `${100 - scale(q3)}%` }}
          />
        </div>
        
        {/* Median line */}
        <div 
          className="absolute h-5 w-0.5 bg-black/20 z-[2]"
          style={{
            top: '75%',
            left: `${scale(median)}%`,
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
        </div>          {/* Price labels with buttons */}
        <div className="absolute -bottom-6 left-[0%]">
          <button 
            className="bg-green-50 rounded-md shadow-sm border border-green-200 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
            onClick={onMinClick}
          >
            £{min.toFixed(2)}
          </button>
        </div>
        <div className="absolute -bottom-6 right-[0%]">
          <button 
            className="bg-red-50 rounded-md shadow-sm border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
            onClick={onMaxClick}
          >
            £{max.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSpectrum;

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import PriceSpectrum from "../PriceSpectrum";
import { colours } from "@/styles/colours";

interface PriceTabContentProps {
  product: Product;
  reviewSummary: ReviewSummary;
  priceStats: {
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
  };
  maxPriceProduct?: Product | null;
  minPriceProduct?: Product | null;
  showMinProduct: boolean;
  showMaxProduct: boolean;
  onMinProductClick: () => void;
  onMaxProductClick: () => void;
}

const PriceTabContent: React.FC<PriceTabContentProps> = ({
  product,
  priceStats,
  maxPriceProduct,
  minPriceProduct,
  showMinProduct,
  showMaxProduct,
  onMinProductClick,
  onMaxProductClick,
}) => {
  const min = priceStats.min;
  const max = priceStats.max;

  return (
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-1 self-start"
        style={{ color: colours.text.primary }}
      >
        Price Range
      </h2>
      <div 
        className="w-full p-4 sm:p-5 rounded-xl border-2 mb-4 opacity-0 animate-slide-in-bottom" 
        style={{ 
          animationDelay: '0.15s',
          backgroundColor: '#f1f5fb', // baby blue
          borderColor: colours.content.border
        }}
      >
        <PriceSpectrum 
          product={product} 
          priceStats={priceStats}
          onMinClick={onMinProductClick}
          onMaxClick={onMaxProductClick}
        />
      </div>
      
      {/* Product Details Section */}
      {(showMinProduct || showMaxProduct) && (
        <div 
          className="w-full mt-12 p-4 rounded-lg opacity-0 animate-slide-in-bottom" 
          style={{ 
            animationDelay: '0.25s',
            backgroundColor: `${colours.content.surface}99` // 60% opacity
          }}
        >
          <Link 
            href={`/product/${showMinProduct ? minPriceProduct?.id : maxPriceProduct?.id}`}
            className="flex items-start gap-4 hover:opacity-80 transition-opacity"
          >
            <div 
              className="flex-shrink-0 w-16 h-16 rounded-md shadow-sm border overflow-hidden"
              style={{ 
                backgroundColor: colours.content.surface,
                borderColor: colours.content.border
              }}
            >
              <Image
                src={(showMinProduct ? minPriceProduct?.imageUrl : maxPriceProduct?.imageUrl) || '/placeholder.jpg'}
                alt={showMinProduct ? minPriceProduct?.productName || 'Product' : maxPriceProduct?.productName || 'Product'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 
                className="font-medium text-sm mb-1"
                style={{ color: colours.text.primary }}
              >
                {showMinProduct ? 'Lowest Price Option' : 'Highest Price Option'}
              </h3>
              <h4 
                className="font-semibold text-base mb-1 hover:underline"
                style={{ color: colours.text.primary }}
              >
                {showMinProduct ? minPriceProduct?.productName : maxPriceProduct?.productName}
              </h4>
              <p 
                className="text-sm mb-2"
                style={{ color: colours.text.secondary }}
              >
                {showMinProduct ? minPriceProduct?.brandName : maxPriceProduct?.brandName}
              </p>
              <div className="flex items-center gap-2">
                <span 
                  className="font-medium"
                  style={{ 
                    color: showMinProduct ? colours.score.high : colours.score.low
                  }}
                >
                  £{showMinProduct ? min.toFixed(2) : max.toFixed(2)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PriceTabContent;

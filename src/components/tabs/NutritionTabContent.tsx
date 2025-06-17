import React from "react";
import { Product } from "@/types/product";
import { colours } from "@/styles/colours";

interface NutritionTabContentProps {
  product: Product;
  animatedNutrition: number;
}

const NutritionTabContent: React.FC<NutritionTabContentProps> = ({
  product,
  animatedNutrition,
}) => {
  return (
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in px-1" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Nutrition
      </h2>
      {/* Nutriscore Card */}
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
              Nutriscore
            </span>
            <span 
              className="text-[10px]"
              style={{ color: colours.text.muted }}
            >
              Certified by the Food Standards Agency
            </span>
          </div>
          <div className="flex-shrink-0">
            <div 
              className="relative w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: (() => {
                  const score = animatedNutrition;
                  const grade = product.combinedNutritionGrade;
                  if (!grade) return colours.text.muted; // Grey for missing nutriscore
                  if (score <= 2) return colours.score.low;
                  if (score <= 3) return colours.score.medium;
                  return colours.score.high;
                })(),
                backgroundColor: (() => {
                  const score = animatedNutrition;
                  const grade = product.combinedNutritionGrade;
                  if (!grade) return colours.text.muted + '20'; // Grey for missing nutriscore
                  if (score <= 2) return colours.score.low + '20'; // 20% opacity
                  if (score <= 3) return colours.score.medium + '20';
                  return colours.score.high + '20';
                })(),
              }}
            >
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="18"
                    fill="none"
                    stroke={(() => {
                      const score = animatedNutrition;
                      const grade = product.combinedNutritionGrade;
                      if (!grade) return colours.text.muted; // Grey for missing nutriscore
                      if (score <= 2) return colours.score.low;
                      if (score <= 3) return colours.score.medium;
                      return colours.score.high;
                    })()}
                    strokeWidth="3"
                    strokeDasharray={Math.PI * 2 * 18}
                    strokeDashoffset={Math.PI * 2 * 18 * (1 - (animatedNutrition / 5))}
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
                    style={{
                      color: (() => {
                        const score = animatedNutrition;
                        const grade = product.combinedNutritionGrade;
                        if (!grade) return colours.text.muted; // Grey for missing nutriscore
                        if (score <= 2) return colours.score.low;
                        if (score <= 3) return colours.score.medium;
                        return colours.score.high;
                      })()
                    }}
                  >
                    {product.combinedNutritionGrade?.toUpperCase() || '--'}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Information Card */}
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
              Nutrition Facts
            </span>
            <span 
              className="text-xs"
              style={{ color: colours.text.secondary }}
            >
              per 100g
            </span>
          </div>
          {product.nutritionMacros && Object.values(product.nutritionMacros).some(value => value !== undefined) ? (
            <div className="w-full">
              <div className="flex flex-wrap gap-1.5 pb-2 break-words">
              {product.nutritionMacros.energy !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Energy: {product.nutritionMacros.energy} kcal
                </span>
              )}
              {product.nutritionMacros.proteins !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Protein: {product.nutritionMacros.proteins}g
                </span>
              )}
              {product.nutritionMacros.carbohydrates !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Carbs: {product.nutritionMacros.carbohydrates}g
                </span>
              )}
              {product.nutritionMacros.sugars !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Sugars: {product.nutritionMacros.sugars}g
                </span>
              )}
              {product.nutritionMacros.fat !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Fat: {product.nutritionMacros.fat}g
                </span>
              )}
              {product.nutritionMacros.saturatedFat !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Sat. Fat: {product.nutritionMacros.saturatedFat}g
                </span>
              )}
              {product.nutritionMacros.fiber !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Fiber: {product.nutritionMacros.fiber}g
                </span>
              )}
              {product.nutritionMacros.sodium !== undefined && (
                <span 
                  className="text-xs px-2 py-1 rounded-full border-2 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: colours.text.primary,
                    borderColor: colours.content.border + 'CC' // 80% opacity
                  }}
                >
                  Sodium: {(product.nutritionMacros.sodium * 1000).toFixed(0)}mg
                </span>
              )}
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-center py-4"
              style={{ color: colours.text.secondary }}
            >
              No nutrition information available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionTabContent;

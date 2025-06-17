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
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Nutrition
      </h2>
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        {/* Nutrition Grade Circle */}
        <div className="flex flex-col items-center gap-2">
          <span className="relative inline-block w-24 h-24 align-middle">
            <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
              <circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke={(() => {
                  const score = animatedNutrition;
                  if (score <= 2) return colours.score.low;
                  if (score <= 3) return colours.score.medium;
                  return colours.score.high;
                })()}
                strokeWidth="8"
                strokeDasharray={Math.PI * 2 * 40}
                strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedNutrition / 5))}
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
                className="text-4xl font-bold"
                style={{
                  color: (() => {
                    const score = animatedNutrition;
                    if (score <= 2) return colours.score.low;
                    if (score <= 3) return colours.score.medium;
                    return colours.score.high;
                  })()
                }}
              >
                {product.combinedNutritionGrade?.toUpperCase() || '?'}
              </span>
            </div>
          </span>
          <span 
            className="text-sm font-medium"
            style={{ color: colours.text.secondary }}
          >
            Nutrition Grade
          </span>
        </div>

        {/* Nutrition Macros per 100g */}
        {product.nutritionMacros && Object.values(product.nutritionMacros).some(value => value !== undefined) && (
          <div className="w-full mt-4">
            <h3 
              className="text-md font-semibold mb-3 text-center"
              style={{ color: colours.text.primary }}
            >
              Nutrition Facts (per 100g)
            </h3>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
              {product.nutritionMacros.energy !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Energy</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.energy} kcal</span>
                </div>
              )}
              {product.nutritionMacros.proteins !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Protein</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.proteins}g</span>
                </div>
              )}
              {product.nutritionMacros.carbohydrates !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Carbs</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.carbohydrates}g</span>
                </div>
              )}
              {product.nutritionMacros.sugars !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Sugars</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.sugars}g</span>
                </div>
              )}
              {product.nutritionMacros.fat !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Fat</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.fat}g</span>
                </div>
              )}
              {product.nutritionMacros.saturatedFat !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Sat. Fat</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.saturatedFat}g</span>
                </div>
              )}
              {product.nutritionMacros.fiber !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Fiber</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{product.nutritionMacros.fiber}g</span>
                </div>
              )}
              {product.nutritionMacros.sodium !== undefined && (
                <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: colours.content.surfaceSecondary }}>
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>Sodium</span>
                  <span className="text-sm font-bold" style={{ color: colours.text.primary }}>{(product.nutritionMacros.sodium * 1000).toFixed(0)}mg</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionTabContent;

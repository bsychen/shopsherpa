import React, { useEffect, useState } from "react";

const TAB_ICONS: Record<string, React.ReactNode> = {
  Price: <img src="/pound-svgrepo-com.svg" alt="Price" className="w-6 h-6" />,
  Quality: <img src="/quality-supervision-svgrepo-com.svg" alt="Quality" className="w-6 h-6" />,
  Nutrition: <img src="/meal-svgrepo-com.svg" alt="Nutrition" className="w-6 h-6" />,
  Sustainability: <img src="/leaf-svgrepo-com.svg" alt="Sustainability" className="w-6 h-6" />,
  Brand: <img src="/prices-svgrepo-com.svg" alt="Brand" className="w-6 h-6" />,
};

const TAB_BG_COLORS: Record<string, string> = {
  Price: "bg-yellow-50",
  Quality: "bg-red-50",
  Nutrition: "bg-blue-50",
  Sustainability: "bg-lime-50",
  Brand: "bg-purple-50",
};

export default function TabbedInfoBox({ activeTab, setActiveTab, product, reviewSummary }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: any;
  reviewSummary: any;
}) {
  const tabs = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"];
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [animatedBrand, setAnimatedBrand] = useState(0);
  const [animatedSustainability, setAnimatedSustainability] = useState(0);

  // Animation trigger function
  const triggerAnimation = (tab: string) => {
    if (tab === "Price") {
      setAnimatedValue(0);
      setTimeout(() => setAnimatedValue(reviewSummary?.averageValueRating || 0), 50);
    }
    if (tab === "Quality") {
      setAnimatedQuality(0);
      setTimeout(() => setAnimatedQuality(reviewSummary?.averageQualityRating || 0), 50);
    }
    if (tab === "Brand") {
      setAnimatedBrand(0);
      setTimeout(() => setAnimatedBrand(75), 50); // Replace with real data if available
    }
    if (tab === "Sustainability") {
      setAnimatedSustainability(0);
      setTimeout(() => setAnimatedSustainability(85), 50); // Replace with real data if available
    }
  };

  useEffect(() => {
    triggerAnimation(activeTab);
    // eslint-disable-next-line
  }, [activeTab, reviewSummary]);

  return (
    <div className={`w-full max-w-xl mt-4 border border-zinc-200 rounded-xl shadow p-4 transition-colors duration-300 ${TAB_BG_COLORS[activeTab]}`}>
      {/* Tab Headers */}
      <div className="flex mb-4 border-b border-zinc-100 justify-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`flex flex-col items-center px-2 py-1 font-semibold transition border-b-2
              ${activeTab === tab ? "border-blue-500 text-blue-700" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
            onClick={() => {
              setActiveTab(tab);
              triggerAnimation(tab);
            }}
            style={{ minWidth: 44 }}
            aria-label={tab}
          >
            {TAB_ICONS[tab]}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === "Price" && reviewSummary && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Price</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="5"
                    strokeDasharray={Math.PI * 2 * 20}
                    strokeDashoffset={Math.PI * 2 * 20}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="5"
                    strokeDasharray={Math.PI * 2 * 20}
                    strokeDashoffset={Math.PI * 2 * 20 * (1 - (animatedValue / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">💰</span>
              </span>
              <span className="ml-1 text-xs text-zinc-500">Avg Score: {reviewSummary.averageValueRating?.toFixed(2)}</span>
            </div>
            <div className="w-full">
              <div className="font-semibold mb-1 text-xs md:text-base">Value for Money</div>
              <div className="flex flex-col gap-1 h-auto w-full">
                {[5,4,3,2,1].map(star => (
                  <div
                    key={star}
                    className="flex items-center mb-0.5 w-full group focus:outline-none"
                  >
                    <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                    <div
                      className="bg-yellow-400 rounded h-3 transition-all duration-700 animate-bar-grow group-hover:bg-yellow-500"
                      style={{ width: `${Math.max(6, Number(reviewSummary.valueDistribution?.[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.valueDistribution?.[star] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Quality" && reviewSummary && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Quality</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="5"
                    strokeDasharray={Math.PI * 2 * 20}
                    strokeDashoffset={Math.PI * 2 * 20 * (1 - (animatedQuality / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <span className="relative z-10 flex items-center justify-center w-12 h-12 text-3xl">🍎</span>
              </span>
              <span className="ml-1 text-xs text-zinc-500">Avg Score: {reviewSummary.averageQualityRating?.toFixed(2)}</span>
            </div>
            <div className="w-full">
              <div className="font-semibold mb-1 text-xs md:text-base">Quality</div>
              <div className="flex flex-col gap-1 h-auto w-full">
                {[5,4,3,2,1].map(star => (
                  <div
                    key={star}
                    className="flex items-center mb-0.5 w-full group focus:outline-none"
                  >
                    <span className="text-[10px] w-5 text-right mr-1">{star}★</span>
                    <div
                      className="bg-red-400 rounded h-3 transition-all duration-700 animate-bar-grow group-hover:bg-red-500"
                      style={{ width: `${Math.max(6, Number(reviewSummary.qualityDistribution?.[star] || 0) * 12)}px`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    <span className="text-[10px] text-gray-500 ml-1">{String(reviewSummary.qualityDistribution?.[star] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Nutrition" && product && (
          <div className="w-full text-left text-sm text-zinc-700 space-y-1 mt-2">
            <h2 className="text-lg font-bold mb-2">Nutrition</h2>
            {product.nutritionGrade && <div><b>Nutrition Grade:</b> {product.nutritionGrade}</div>}
            {product.nutritionGrades && <div><b>Nutrition Grades:</b> {product.nutritionGrades}</div>}
            {product.nutritionGradesTags && <div><b>Nutrition Grades Tags:</b> {product.nutritionGradesTags.join(", ")}</div>}
            {product.nutritionGradeFr && <div><b>Nutrition Grade (FR):</b> {product.nutritionGradeFr}</div>}
            {product.nutritionScoreBeverage && <div><b>Nutrition Score (Beverage):</b> {product.nutritionScoreBeverage}</div>}
            {product.nutriments && (
              <div className="mt-2">
                <b>Nutriments:</b>
                <ul className="ml-4 list-disc">
                  {Object.entries(product.nutriments).map(([key, value]) => (
                    <li key={key}><b>{key}:</b> {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.ingredientsText && <div><b>Ingredients:</b> {product.ingredientsText}</div>}
            {product.allergens && <div><b>Allergens:</b> {product.allergens}</div>}
            {product.tracesTags && product.tracesTags.length > 0 && <div><b>Traces:</b> {product.tracesTags.join(", ")}</div>}
            {product.labels && <div><b>Labels:</b> {product.labels}</div>}
            {product.labelsTags && product.labelsTags.length > 0 && <div><b>Labels Tags:</b> {product.labelsTags.join(", ")}</div>}
          </div>
        )}
        {activeTab === "Brand" && product && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Brand</h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedBrand / 100))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl">🏢</span>
                  <span className="text-2xl font-bold text-zinc-800">{animatedBrand}</span>
                </div>
              </span>
              <span className="text-sm text-zinc-600 font-medium">{product.brandName || 'Unknown'}</span>
            </div>
          </div>
        )}
        {activeTab === "Sustainability" && product && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Sustainability</h2>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="relative inline-block w-24 h-24 align-middle">
                <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="#86efac"
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
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 2 * 40}
                    strokeDashoffset={Math.PI * 2 * 40 * (1 - (animatedSustainability / 100))}
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
                  <span className="text-2xl font-bold text-zinc-800">{animatedSustainability}</span>
                </div>
              </span>
              <span className="text-sm text-zinc-600 font-medium">Sustainability Score</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
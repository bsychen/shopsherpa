"use client";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useState, useEffect } from "react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- Constants for colors, borders, SVGs ---
const BUTTON_CONFIG: Record<string, { color: string; border: string; svg: string }> = {
  Price: {
    color: "bg-yellow-100",
    border: "border-yellow-200",
    svg: "/pound-svgrepo-com.svg",
  },
  Value: {
    color: "bg-yellow-100",
    border: "border-yellow-200",
    svg: "/pound-svgrepo-com.svg",
  },
  Quality: {
    color: "bg-red-100",
    border: "border-red-200",
    svg: "/quality-supervision-svgrepo-com.svg",
  },
  Nutrition: {
    color: "bg-green-100",
    border: "border-green-200",
    svg: "/meal-svgrepo-com.svg",
  },
  Sustainability: {
    color: "bg-lime-100",
    border: "border-lime-200",
    svg: "/leaf-svgrepo-com.svg",
  },
  Brand: {
    color: "bg-blue-100",
    border: "border-blue-200",
    svg: "/prices-svgrepo-com.svg",
  },
};
const DEFAULT_BTN_COLOR = "bg-zinc-100";
const DEFAULT_BTN_BORDER = "border-zinc-200";
const DEFAULT_BTN_SVG = "/placeholder-logo.png";

export default function ProductRadarChart({
  data = [4, 3, 5, 2, 4],
  labels = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"],
  product,
  reviewSummary,
}: {
  data?: number[];
  labels?: string[];
  product?: any;
  reviewSummary?: any;
}) {
  // Chart.js config
  const chartData = {
    labels: labels.map(() => ""),
    datasets: [
      {
        label: "Product Attributes",
        data,
        backgroundColor: "rgba(96, 165, 250, 0.5)",
        borderColor: "#2563eb",
        borderWidth: 2,
        pointBackgroundColor: "#2563eb",
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false },
        grid: { color: "#e5e7eb" },
        pointLabels: { color: "#334155", font: { size: 16 } },
      },
    },
  };

  // Layout constants
  const containerSize = 260;
  const btnBase = 40;
  const margin = 8;
  const radarPadding = 38;
  const maxRadius = (containerSize / 2) - (btnBase / 2) - margin;
  const minRadius = (containerSize / 2) - radarPadding;
  const buttonRadius = Math.max(minRadius, Math.min(maxRadius, 160));
  const center = containerSize / 2;
  const angleStep = (2 * Math.PI) / labels.length;
  const offset = 1.2;
  const verticalShift = 14;

  // Animation state
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedQuality, setAnimatedQuality] = useState(0);
  const [animatedBrand, setAnimatedBrand] = useState(0);
  const [animatedSustainability, setAnimatedSustainability] = useState(0);
  useEffect(() => { setShowButtons(true); }, []);
  useEffect(() => {
    if (openPopup === "Value" || openPopup === "Price") {
      setAnimatedValue(0);
      setTimeout(() => setAnimatedValue(reviewSummary?.averageValueRating || 0), 50);
    }
    if (openPopup === "Quality") {
      setAnimatedQuality(0);
      setTimeout(() => setAnimatedQuality(reviewSummary?.averageQualityRating || 0), 50);
    }
    if (openPopup === "Brand") {
      setAnimatedBrand(0);
      setTimeout(() => setAnimatedBrand(75), 50);
    }
    if (openPopup === "Sustainability") {
      setAnimatedSustainability(0);
      setTimeout(() => setAnimatedSustainability(85), 50); // Example score of 85/100
    }
  }, [openPopup, reviewSummary]);

  // --- Render ---
  return (
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      {/* Radar Chart */}
      <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
        <Radar data={chartData} options={options} style={{ maxHeight: 240, maxWidth: 240 }} />
      </div>
      {/* Category Buttons */}
      {labels.map((label, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center + buttonRadius * Math.cos(angle) * offset - btnBase / 2;
        const y = center + buttonRadius * Math.sin(angle) * offset - btnBase / 2 + verticalShift;
        const config = BUTTON_CONFIG[label] || { color: DEFAULT_BTN_COLOR, border: DEFAULT_BTN_BORDER, svg: DEFAULT_BTN_SVG };
        const transition = "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)";
        const delay = `${i * 80}ms`;
        return (
          <button
            key={label}
            type="button"
            className={`absolute flex items-center justify-center rounded-xl shadow border ${config.color} ${config.border}`}
            style={{
              left: x,
              top: y,
              width: btnBase,
              height: btnBase,
              zIndex: 2,
              pointerEvents: "auto",
              padding: 0,
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? "scale(1)" : "scale(0.5)",
              transition,
              transitionDelay: delay,
            }}
            tabIndex={-1}
            aria-label={label}
            onClick={() => setOpenPopup(label)}
          >
            <img
              src={config.svg}
              alt={label}
              className="w-5 h-5 filter grayscale brightness-0 invert-0"
              style={{ filter: "grayscale(1) brightness(0.6)" }}
            />
          </button>
        );
      })}
      {/* Popup Modal */}
      {openPopup && (() => {
        const config = BUTTON_CONFIG[openPopup] || { color: DEFAULT_BTN_COLOR, border: DEFAULT_BTN_BORDER };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpenPopup(null)}>
            <div
              className={`relative rounded-2xl shadow-xl p-8 min-w-[220px] min-h-[120px] flex flex-col items-center ${config.color} ${config.border}`}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800 text-2xl font-bold"
                onClick={() => setOpenPopup(null)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
              <div className="text-2xl font-bold mb-2 capitalize text-zinc-800">{openPopup}</div>
              {/* Value/Price Info Listing */}
              {(openPopup === "Value" || openPopup === "Price") && reviewSummary && (
                <div className="w-full flex flex-col items-center">
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
              {/* Quality Info Listing */}
              {openPopup === "Quality" && reviewSummary && (
                <div className="w-full flex flex-col items-center">
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
              {/* Nutrition Info Listing */}
              {openPopup === "Nutrition" && product && (
                <div className="w-full text-left text-sm text-zinc-700 space-y-1 mt-2">
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
              {/* Brand Info Listing */}
              {openPopup === "Brand" && product && (
                <div className="w-full flex flex-col items-center">
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
              {/* Sustainability Info Listing */}
              {openPopup === "Sustainability" && product && (
                <div className="w-full flex flex-col items-center">
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
      })()}
      {/* End Popup Modal */}
    </div>
  );
}
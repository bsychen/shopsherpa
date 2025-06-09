"use client";
import { Radar } from "react-chartjs-2";
import Image from "next/image";
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
import { Product } from "@/types/product";
import { ReviewSummary } from "@/types/reviewSummary";
import { getBrandById } from "@/lib/api";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- Constants for colors, borders, SVGs ---
const BUTTON_CONFIG: Record<string, { color: string; border: string; svg: string }> = {
  Price: {
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
    color: "bg-blue-100",
    border: "border-blue-200",
    svg: "/meal-svgrepo-com.svg",
  },
  Sustainability: {
    color: "bg-lime-100",
    border: "border-green-200",
    svg: "/leaf-svgrepo-com.svg",
  },
  Brand: {
    color: "bg-purple-100",
    border: "border-purple-200",
    svg: "/prices-svgrepo-com.svg",
  },
};
const DEFAULT_BTN_COLOR = "bg-zinc-100";
const DEFAULT_BTN_BORDER = "border-zinc-200";
const DEFAULT_BTN_SVG = "/placeholder-logo.png";

export default function ProductRadarChart({
  product,
  reviewSummary,
  activeTab,
  setActiveTab,
  priceScore = 3,
}: {
  product?: Product;
  reviewSummary?: ReviewSummary;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  priceScore?: number;
}) {
  const [brandScore, setBrandScore] = useState<number>(3); // Default score

  // Fetch brand score when product changes
  useEffect(() => {
    if (product?.brandId) {
      getBrandById(product.brandId).then(brand => {
        if (brand?.brandRating) {
          setBrandScore(brand.brandRating);
        }
      });
    }
  }, [product?.brandId]);

  // Convert nutrition grade to score (A=5, B=4, C=3, D=2, E=1, unknown=2)
  function getNutritionScore(grade: string): number {
    const scores: Record<string, number> = {
      'a': 5,
      'b': 4,
      'c': 3,
      'd': 2,
      'e': 1
    };
    return scores[grade.toLowerCase()] || 2;
  }

  // Calculate price score based on quartile position (5 if in lower quartile, 1 if in upper quartile, 3 otherwise)


  const radarData = [
    priceScore, // Price score based on quartile position
    reviewSummary?.averageQualityRating || 3, // Quality score from average quality rating
    getNutritionScore(product?.combinedNutritionGrade || ''), // Nutrition score from grade
    product?.sustainbilityScore || 3, // Sustainability score from product data
    brandScore, // Brand score from brand data
  ];

  // Chart.js config
  const chartData = {
    labels: ["Price", "Quality", "Nutrition", "Sustainability", "Brand"].map(() => ""),
    datasets: [
      {
        label: "Product Attributes",
        data: radarData,
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
  // Layout constants
  const containerSize = 260;
  const btnBase = 40;
  const margin = 8;
  const radarPadding = 38;
  const maxRadius = (containerSize / 2) - (btnBase / 2) - margin;
  const minRadius = (containerSize / 2) - radarPadding;
  const buttonRadius = Math.max(minRadius, Math.min(maxRadius, 160));
  const center = containerSize / 2;
  const LABELS = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"];
  const angleStep = (2 * Math.PI) / LABELS.length;
  const offset = 1.2;
  const verticalShift = 14;
  // Animation state
  const [openPopup] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [_animatedState, setAnimatedState] = useState<Record<string, number>>({
    value: 0,
    quality: 0,
    brand: 0,
    sustainability: 0
  });

  useEffect(() => { setShowButtons(true); }, []);

  useEffect(() => {
    const animateValue = (key: string, value: number) => {
      setAnimatedState(prev => ({ ...prev, [key]: 0 }));
      setTimeout(() => setAnimatedState(prev => ({ ...prev, [key]: value })), 50);
    };

    if (openPopup === "Value" || openPopup === "Price") {
      animateValue('value', reviewSummary?.averageValueRating || 0);
    }
    if (openPopup === "Quality") {
      animateValue('quality', reviewSummary?.averageQualityRating || 0);
    }
    if (openPopup === "Brand") {
      animateValue('brand', 75);
    }
    if (openPopup === "Sustainability") {
      animateValue('sustainability', 85);
    }
  }, [openPopup, reviewSummary]);

  // --- Render ---
  return (
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      {/* Radar Chart */}
      <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
        <Radar data={chartData} options={options} style={{ maxHeight: 240, maxWidth: 240 }} />
      </div>
      {/* Radar Buttons */}
      {LABELS.map((label, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center + buttonRadius * Math.cos(angle) * offset - btnBase / 2;
        const y = center + buttonRadius * Math.sin(angle) * offset - btnBase / 2 + verticalShift;
        const config = BUTTON_CONFIG[label] || { color: DEFAULT_BTN_COLOR, border: DEFAULT_BTN_BORDER, svg: DEFAULT_BTN_SVG };
        const delay = `${i * 80}ms`;
        return (
          <button
            key={label}
            type="button"
            className={`absolute flex items-center justify-center rounded-xl shadow border ${config.color} ${config.border} ${activeTab === label ? "ring-2 ring-zinc-200 scale-110" : ""}`}
            style={{
              left: x,
              top: y,
              width: btnBase,
              height: btnBase,
              zIndex: 2,
              pointerEvents: "auto",
              padding: 0,
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? (activeTab === label ? "scale(1.10)" : "scale(1)") : "scale(0.5)",
              transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)",
              transitionDelay: delay,
            }}
            tabIndex={-1}
            aria-label={label}
            onClick={() => setActiveTab(label)}
          >
            <Image
              src={config.svg}
              alt={label}
              width={20}
              height={20}
              className="w-5 h-5 filter grayscale brightness-0 invert-0"
              style={{ filter: "grayscale(1) brightness(0.6)" }}
            />
          </button>
        );
      })}
    </div>
  );
}
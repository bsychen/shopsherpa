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
import { useState, useEffect, useRef } from "react";
import { colours } from "@/styles/colours";
import AllergenWarningIcon from "./AllergenWarningIcon";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function AnimatedMatchPercent({ percent, hasAllergens = false }: { percent: number, hasAllergens?: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const currentPercent = percent * progress;
      setDisplayed(Math.round(currentPercent));
      setAnimatedPercent(currentPercent);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayed(percent);
        setAnimatedPercent(percent);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [percent]);

  // Color logic - red if allergens are flagged, otherwise based on percentage
  const color = hasAllergens 
    ? { text: `${colours.status.error.background}80` }
    : displayed >= 70
    ? { text: colours.score.high }
    : displayed >= 50
    ? { text: colours.score.medium }
    : { text: colours.score.low };

  return (
    <span className="relative flex flex-col items-center justify-center min-w-[70px] min-h-[70px]">
      {/* Ring animation background */}
      <svg width="70" height="70" viewBox="0 0 70 70" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
        <circle
          cx="35" cy="35" r="30"
          fill="none"
          stroke={color.text}
          strokeWidth="6"
          strokeDasharray={Math.PI * 2 * 30}
          strokeDashoffset={Math.PI * 2 * 30 * (1 - (animatedPercent / 100))}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
          }}
        />
      </svg>
      <span
        className="font-bold text-lg relative z-10"
        style={{ color: color.text, pointerEvents: 'none', userSelect: 'none' }}
      >
        {displayed}%
      </span>
      <span 
        className="block font-medium text-center text-xs relative z-10"
        style={{ color: colours.text.secondary, marginTop: '-2px' }}
      >
        match
      </span>
    </span>
  );
}

const BUTTON_CONFIG: Record<string, { color: string; border: string; svg: string }> = {
  Price: {
    color: colours.categories.price.background,
    border: colours.categories.price.border,
    svg: "/pound-svgrepo-com.svg",
  },
  Quality: {
    color: colours.categories.quality.background,
    border: colours.categories.quality.border,
    svg: "/quality-supervision-svgrepo-com.svg",
  },
  Nutrition: {
    color: colours.categories.nutrition.background,
    border: colours.categories.nutrition.border,
    svg: "/meal-svgrepo-com.svg",
  },
  Sustainability: {
    color: colours.categories.sustainability.background,
    border: colours.categories.sustainability.border,
    svg: "/leaf-svgrepo-com.svg",
  },
  Brand: {
    color: colours.categories.brand.background,
    border: colours.categories.brand.border,
    svg: "/prices-svgrepo-com.svg",
  },
};
const DEFAULT_BTN_COLOR = "bg-zinc-100";
const DEFAULT_BTN_BORDER = "border-zinc-200";
const DEFAULT_BTN_SVG = "/placeholder-logo.png";

export default function ProductRadarChart({
  activeTab,
  setActiveTab,
  priceScore = 3,
  qualityScore = 3,
  nutritionScore = 2,
  sustainabilityScore = 3,
  brandScore = 3,
  matchPercentage = null,
  allergenWarnings = [],
  onAllergenWarningClick,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  priceScore?: number;
  qualityScore?: number;
  nutritionScore?: number;
  sustainabilityScore?: number;
  brandScore?: number;
  matchPercentage?: number | null;
  allergenWarnings?: string[];
  onAllergenWarningClick?: () => void;
}) {
  // Initialize allergen expanded state based on whether allergens exist
  const radarData = [
    priceScore,
    qualityScore,
    nutritionScore,
    sustainabilityScore,
    brandScore,
  ];

  // Chart.js config
  const chartData = {
    labels: ["Price", "Quality", "Nutrition", "Sustainability", "Brand"].map(() => ""),
    datasets: [
      {
        label: "Product Attributes",
        data: radarData,
        backgroundColor: `${colours.chart.primary}80`,
        borderColor: `${colours.chart.grid}80`,
        borderWidth: 2,
        pointBackgroundColor: colours.chart.primary,
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
        grid: { color: "#9CA3AF" },
        pointLabels: { color: colours.chart.text, font: { size: 16 } },
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
  const LABELS = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"];
  const angleStep = (2 * Math.PI) / LABELS.length;
  const offset = 1.2;
  const verticalShift = 14;
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => { 
    setShowButtons(true);
  }, []);

  return (
    <div className="relative">
      {/* Main content container */}
      <div className="flex flex-col items-center gap-4">
        {/* Radar Chart Container */}
        <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
          {/* Match Percentage in top right corner with allergen warning icon */}
          {matchPercentage !== null && (
            <div className="absolute top-2 right-2 z-10">
              <AnimatedMatchPercent 
                percent={matchPercentage} 
                hasAllergens={allergenWarnings && allergenWarnings.length > 0}
              />
              <AllergenWarningIcon 
                hasAllergens={allergenWarnings && allergenWarnings.length > 0}
                onClick={() => onAllergenWarningClick?.()}
              />
            </div>
          )}
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
            className={`absolute flex items-center justify-center rounded-xl shadow-lg border-2 border-black ${config.color} ${activeTab === label ? "ring-2 ring-zinc-200 scale-110" : ""}`}
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
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            tabIndex={-1}
            aria-label={label}
            onClick={() => {
              if (activeTab === label) {
                // If clicking the already active tab, clear the selection
                setActiveTab("");
              } else {
                // If clicking a different tab, set it as active
                setActiveTab(label);
              }
            }}
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
      </div>
    </div>
  );
}

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
import AllergenWarning from "./AllergenWarning";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function AnimatedMatchPercent({ percent }: { percent: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplayed(Math.round(percent * progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayed(percent);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [percent]);

  // Color logic
  const color = displayed >= 70
    ? { text: colours.score.high }
    : displayed >= 50
    ? { text: colours.score.medium }
    : { text: colours.score.low };

  return (
    <span className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px]">
      <span
        className="font-bold text-lg"
        style={{ color: color.text, pointerEvents: 'none', userSelect: 'none' }}
      >
        {displayed}%
      </span>
      <span 
        className="block font-medium mt-0.5 text-center text-xs"
        style={{ color: colours.text.secondary }}
      >
        match
      </span>
    </span>
  );
}

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
  activeTab,
  setActiveTab,
  priceScore = 3,
  qualityScore = 3,
  nutritionScore = 2,
  sustainabilityScore = 3,
  brandScore = 3,
  matchPercentage = null,
  allergenWarnings = [],
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
}) {
  const [isAllergenExpanded, setIsAllergenExpanded] = useState(false);
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

  useEffect(() => { setShowButtons(true); }, []);

  // Calculate vertical offset when allergen warning is expanded
  const chartVerticalOffset = isAllergenExpanded ? 120 : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      {/* Allergen Warning - top left corner */}
      {allergenWarnings && allergenWarnings.length > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <AllergenWarning 
            allergenWarnings={allergenWarnings} 
            isEmbedded={true}
            onExpandedChange={setIsAllergenExpanded}
          />
        </div>
      )}
      <div 
      className="relative flex items-center justify-center transition-all duration-500 ease-in-out" 
      style={{ 
        width: containerSize, 
        height: containerSize,
        transform: `translateY(${chartVerticalOffset}px)`
      }}
    >
      {/* Match Percentage in top right corner */}
      {matchPercentage !== null && (
        <div className="absolute top-2 right-2 z-10">
          <AnimatedMatchPercent percent={matchPercentage} />
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
    </div>
  );
}

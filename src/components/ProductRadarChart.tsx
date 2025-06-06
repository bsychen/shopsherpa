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
}: {
  data?: number[];
  labels?: string[];
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
  useEffect(() => { setShowButtons(true); }, []);

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
            </div>
          </div>
        );
      })()}
    </div>
  );
}
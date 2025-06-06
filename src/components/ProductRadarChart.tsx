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
import { useState } from "react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ProductRadarChart({
  data = [4, 3, 5, 2, 4], // Replace with real data as needed
  labels = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"],
}: {
  data?: number[];
  labels?: string[];
}) {
  // Hide Chart.js point labels
  const chartData = {
    labels: labels.map(() => ''),
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
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false }, // Hide the numbers 1-5 on the lines
        grid: { color: "#e5e7eb" },
        pointLabels: { color: "#334155", font: { size: 16 } },
      },
    },
  };

  // Calculate positions for each label/button
  const containerSize = 260;
  const btnBase = 40; // smaller button size for more margin
  const margin = 8; // px, margin from edge
  const radarPadding = 38; // px, minimum distance from radar diagram (increased)
  // The farthest a button can go is (containerSize / 2) - (btnBase / 2) - margin
  const maxRadius = (containerSize / 2) - (btnBase / 2) - margin;
  // The closest a button can be to the center without touching the radar diagram
  const minRadius = (containerSize / 2) - radarPadding;
  // Place the button between minRadius and maxRadius, slightly offset from the vertex
  const buttonRadius = Math.max(minRadius, Math.min(maxRadius, 160));
  const center = containerSize / 2;
  const angleStep = (2 * Math.PI) / labels.length;

  const [openPopup, setOpenPopup] = useState<string | null>(null);

  return (
    <div className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
      {/* Radar Chart */}
      <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
        <Radar data={chartData} options={options} style={{ maxHeight: 240, maxWidth: 240 }} />
      </div>
      {/* Category Buttons */}
      {labels.map((label, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const offset = 1.2;
        const verticalShift = 14; // px, move all buttons down
        const x = center + buttonRadius * Math.cos(angle) * offset - btnBase / 2;
        const y = center + buttonRadius * Math.sin(angle) * offset - btnBase / 2 + verticalShift;
        const labelToSvg: Record<string, string> = {
          'Price': '/pound-svgrepo-com.svg',
          'Quality': '/quality-supervision-svgrepo-com.svg',
          'Nutrition': '/meal-svgrepo-com.svg',
          'Sustainability': '/leaf-svgrepo-com.svg',
          'Brand': '/prices-svgrepo-com.svg',
        };
        const svgSrc = labelToSvg[label] || '/placeholder-logo.png';
        let color = 'bg-zinc-100';
        let border = '';
        if (label === 'Price' || label === 'Value') { color = 'bg-yellow-100'; border = 'border-yellow-200'; }
        else if (label === 'Quality') { color = 'bg-red-100'; border = 'border-red-200'; }
        else if (label === 'Nutrition') { color = 'bg-green-100'; border = 'border-green-200'; }
        else if (label === 'Sustainability') { color = 'bg-lime-100'; border = 'border-lime-200'; }
        else if (label === 'Brand') { color = 'bg-blue-100'; border = 'border-blue-200'; }
        else { border = 'border-zinc-200'; }
        return (
          <button
            key={label}
            type="button"
            className={`absolute flex items-center justify-center rounded-xl shadow border ${color} ${border}`}
            style={{ left: x, top: y, width: btnBase, height: btnBase, zIndex: 2, pointerEvents: 'auto', padding: 0 }}
            tabIndex={-1}
            aria-label={label}
            onClick={() => setOpenPopup(label)}
          >
            <img src={svgSrc} alt={label} className="w-5 h-5 filter grayscale brightness-0 invert-0" style={{ filter: 'grayscale(1) brightness(0.6)' }} />
          </button>
        );
      })}
      {/* Popup Modal */}
      {openPopup && (() => {
        let color = 'bg-zinc-100';
        let border = '';
        if (openPopup === 'Price' || openPopup === 'Value') { color = 'bg-yellow-100'; border = 'border-yellow-200'; }
        else if (openPopup === 'Quality') { color = 'bg-red-100'; border = 'border-red-200'; }
        else if (openPopup === 'Nutrition') { color = 'bg-green-100'; border = 'border-green-200'; }
        else if (openPopup === 'Sustainability') { color = 'bg-lime-100'; border = 'border-lime-200'; }
        else if (openPopup === 'Brand') { color = 'bg-blue-100'; border = 'border-blue-200'; }
        else { border = 'border-zinc-200'; }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpenPopup(null)}>
            <div
              className={`relative rounded-2xl shadow-xl p-8 min-w-[220px] min-h-[120px] flex flex-col items-center ${color} ${border}`}
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
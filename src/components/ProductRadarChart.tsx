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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ProductRadarChart({
  data = [4, 3, 5, 2, 4], // Replace with real data as needed
  labels = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"],
}: {
  data?: number[];
  labels?: string[];
}) {
  const chartData = {
    labels,
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

  return (
    <Radar data={chartData} options={options} style={{ maxHeight: 260 }} />
  );
}
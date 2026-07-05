import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

export const PERIOD_LABELS = {
  today: "Today",
  7: "Last 7 Days",
  30: "Last 30 Days",
  all: "All Time",
};

export const chartColors = {
  azure: "#52AAFF",
  mint: "#66C6A8",
  gold: "#E9B44C",
  violet: "#9B7EDE",
  tick: "#9EA9BD",
  grid: "rgba(255,255,255,.06)",
  legend: "#DCE4F2",
};

export function baseChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: {
        labels: {
          color: chartColors.legend,
          font: { size: 13, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: chartColors.legend,
        borderColor: chartColors.azure,
        borderWidth: 1,
        padding: 12,
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        ticks: { color: chartColors.tick, maxTicksLimit: 7 },
        grid: { color: chartColors.grid },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartColors.tick, precision: 0 },
        grid: { color: chartColors.grid },
      },
    },
  };
}

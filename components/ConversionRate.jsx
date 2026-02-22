"use client";

/**
 * ConversionRate — Win rate / conversion stat with visual indicator
 *
 * Displays:
 * - Circular progress ring showing win rate percentage
 * - Won vs Lost counts below
 * - Average deal size
 *
 * Props:
 *   winRate      (number) - Decimal, e.g., 0.35 for 35%
 *   wonCount     (number) - Total won deals
 *   lostCount    (number) - Total lost deals
 *   avgDealSize  (number) - Average monetary value per deal
 */

import { formatCurrency, formatPercent } from "@/lib/formatters";

export default function ConversionRate({
  winRate = 0,
  wonCount = 0,
  lostCount = 0,
  avgDealSize = 0,
}) {
  // SVG circle dimensions for the progress ring
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate how much of the ring to fill (0% = full gap, 100% = full ring)
  const strokeDashoffset = circumference - winRate * circumference;

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Conversion Rate
      </h3>

      <div className="flex flex-col items-center">
        {/* Circular progress ring */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background ring (gray) */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {/* Foreground ring (colored based on rate) */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={winRate >= 0.5 ? "#10b981" : winRate >= 0.25 ? "#f59e0b" : "#ef4444"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Percentage text centered inside the ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {formatPercent(winRate)}
            </span>
          </div>
        </div>

        {/* Won vs Lost counts */}
        <div className="flex gap-6 mb-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{wonCount}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Won</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{lostCount}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Lost</p>
          </div>
        </div>

        {/* Average deal size */}
        <div className="text-center pt-3 border-t border-gray-100 w-full">
          <p className="text-sm text-gray-500">Avg Deal Size</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatCurrency(avgDealSize)}
          </p>
        </div>
      </div>
    </div>
  );
}

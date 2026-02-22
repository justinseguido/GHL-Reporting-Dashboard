"use client";

/**
 * MetricCard — KPI summary box
 *
 * Displays a single key metric with:
 * - Icon and title
 * - Large formatted value
 * - Percentage change with up/down trend indicator
 *
 * Props:
 *   title    (string) - Metric label (e.g., "Total Leads")
 *   value    (string) - Formatted display value (e.g., "$45.2K")
 *   change   (number) - Decimal change (e.g., 0.12 for +12%)
 *   icon     (string) - Emoji or icon character
 *   color    (string) - Tailwind color class (e.g., "blue", "emerald")
 */

import clsx from "clsx";

// Color map for the accent stripe and icon background
const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
};

export default function MetricCard({ title, value, change, icon, color = "blue" }) {
  const colors = colorMap[color] || colorMap.blue;

  // Determine if the change is positive, negative, or neutral
  const isPositive = change > 0;
  const isNegative = change < 0;
  const changeDisplay = change !== undefined
    ? `${isPositive ? "+" : ""}${(change * 100).toFixed(1)}%`
    : null;

  return (
    <div className={clsx("dashboard-card border-l-4", colors.border)}>
      {/* Top row: icon + title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
            colors.bg
          )}
        >
          {icon}
        </span>
      </div>

      {/* Main value display */}
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>

      {/* Change indicator (shown only if change is provided) */}
      {changeDisplay && (
        <div className="flex items-center gap-1 text-sm">
          {/* Trend arrow */}
          <span
            className={clsx(
              "font-medium",
              isPositive && "text-emerald-600",
              isNegative && "text-red-500",
              !isPositive && !isNegative && "text-gray-400"
            )}
          >
            {isPositive ? "↑" : isNegative ? "↓" : "→"} {changeDisplay}
          </span>
          <span className="text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

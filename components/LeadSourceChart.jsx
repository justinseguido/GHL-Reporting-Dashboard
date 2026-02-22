"use client";

/**
 * LeadSourceChart — Pie chart showing lead source distribution
 *
 * Uses recharts PieChart with:
 * - Color-coded segments for each lead source
 * - Legend showing source names and percentages
 * - Hover tooltip with exact count
 *
 * Props:
 *   data (array) - [{ name: "Facebook", value: 45 }, ...]
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getChartColor } from "@/lib/formatters";

// Custom legend renderer showing colored dots + source name + percentage
function CustomLegend({ payload, totalValue }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
      {payload.map((entry, index) => {
        const pct =
          totalValue > 0
            ? ((entry.payload.value / totalValue) * 100).toFixed(1)
            : 0;
        return (
          <li key={index} className="flex items-center gap-1.5 text-sm">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">
              {entry.value}{" "}
              <span className="text-gray-400">({pct}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function LeadSourceChart({ data = [] }) {
  // Calculate total for percentage labels
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  // Show placeholder if no data
  if (data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lead Sources
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No lead source data available
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Lead Sources
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}   // Donut style for modern look
            outerRadius={100}
            paddingAngle={2}   // Small gap between segments
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {/* Color each segment from our palette */}
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Pie>

          {/* Tooltip showing exact count on hover */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => [`${value} contacts`, name]}
          />

          {/* Custom legend with percentages */}
          <Legend
            content={<CustomLegend totalValue={totalValue} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

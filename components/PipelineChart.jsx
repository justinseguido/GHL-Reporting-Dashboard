"use client";

/**
 * PipelineChart — Bar chart showing opportunity counts per pipeline stage
 *
 * Uses recharts BarChart with:
 * - X-axis: pipeline stage names
 * - Y-axis: number of opportunities in each stage
 * - Color gradient per bar for visual distinction
 * - Responsive container that adapts to parent width
 *
 * Props:
 *   data (array) - [{ name: "Stage Name", value: 12 }, ...]
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getChartColor } from "@/lib/formatters";

export default function PipelineChart({ data = [] }) {
  // Show placeholder if no data
  if (data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pipeline Overview
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No pipeline data available
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pipeline Overview
      </h3>

      {/* ResponsiveContainer makes the chart fill its parent width */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {/* Light grid lines for readability */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          {/* Stage names on X-axis, rotated if long */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />

          {/* Opportunity count on Y-axis */}
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />

          {/* Hover tooltip with count */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value} opportunities`, "Count"]}
          />

          {/* Bars with individual colors per stage */}
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

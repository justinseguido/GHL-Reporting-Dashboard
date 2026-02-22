"use client";

/**
 * BrandingHeader — Top bar with agency logo, name, and date range selector
 *
 * Features:
 * - Agency logo loaded from AGENCY_LOGO_URL (falls back to text)
 * - Agency name and client name display
 * - Date range selector: This Week / This Month / This Quarter
 * - Responsive: stacks vertically on mobile
 *
 * Props:
 *   agencyName  (string) - From env or API
 *   clientName  (string) - From env, API, or URL param
 *   logoUrl     (string) - Agency logo URL
 *   dateRange   (string) - Current selection ("week" | "month" | "quarter")
 *   onDateRangeChange (fn) - Callback when date range changes
 */

import { useState } from "react";
import clsx from "clsx";

const DATE_RANGES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
];

export default function BrandingHeader({
  agencyName = "Agency",
  clientName = "Client",
  logoUrl,
  dateRange = "month",
  onDateRangeChange,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side: Logo + Agency/Client name */}
        <div className="flex items-center gap-4">
          {/* Agency logo — falls back to initial letter if URL fails */}
          {logoUrl && !imgError ? (
            <img
              src={logoUrl}
              alt={`${agencyName} logo`}
              className="h-10 w-auto object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
              {agencyName.charAt(0)}
            </div>
          )}

          <div>
            {/* Agency name */}
            <h1 className="text-lg font-semibold text-gray-900">
              {agencyName}
            </h1>
            {/* Client name subtitle */}
            <p className="text-sm text-gray-500">
              Dashboard for{" "}
              <span className="font-medium text-gray-700">{clientName}</span>
            </p>
          </div>
        </div>

        {/* Right side: Date range selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => onDateRangeChange?.(range.value)}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-md transition-all",
                dateRange === range.value
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

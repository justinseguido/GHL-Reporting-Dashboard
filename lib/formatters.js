/**
 * Data Transformation Helpers
 *
 * Pure utility functions to transform raw GHL API data into
 * chart-ready and display-ready formats for the dashboard.
 */

import { format, subDays, isAfter, parseISO } from "date-fns";

// ── Number & Currency Formatting ──────────────────────

/**
 * Format a number as compact currency (e.g., $12.5K, $1.2M)
 */
export function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

/**
 * Format a decimal as a percentage string (e.g., 0.354 → "35.4%")
 */
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format a number with locale-aware thousands separator
 */
export function formatNumber(value) {
  return Number(value).toLocaleString();
}

// ── Date Helpers ──────────────────────────────────────

/**
 * Format an ISO date string to a human-readable format.
 * e.g., "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    return format(parseISO(isoString), "MMM d, yyyy");
  } catch {
    return "N/A";
  }
}

/**
 * Check if a date falls within the last N days.
 * Used to filter "new this month" contacts, recent conversations, etc.
 */
export function isWithinDays(isoString, days) {
  if (!isoString) return false;
  try {
    const date = parseISO(isoString);
    const cutoff = subDays(new Date(), days);
    return isAfter(date, cutoff);
  } catch {
    return false;
  }
}

// ── Data Aggregation Helpers ──────────────────────────

/**
 * Group an array of objects by a given key.
 * Returns { [keyValue]: [items...] }
 *
 * @example groupBy(contacts, "source") → { "Facebook": [...], "Google": [...] }
 */
export function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "Unknown";
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

/**
 * Calculate percentage change between two numbers.
 * Returns a signed decimal (e.g., 0.15 for +15%).
 */
export function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

/**
 * Convert pipeline stages map into chart-ready data.
 * Input:  { "New Lead": 12, "Qualified": 8, "Proposal": 3, "Won": 2 }
 * Output: [{ name: "New Lead", value: 12 }, { name: "Qualified", value: 8 }, ...]
 */
export function toChartData(groupedData) {
  return Object.entries(groupedData).map(([name, items]) => ({
    name,
    value: Array.isArray(items) ? items.length : items,
  }));
}

/**
 * Compute a color for each chart segment from a preset palette.
 * Cycles through colors if there are more segments than palette entries.
 */
const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

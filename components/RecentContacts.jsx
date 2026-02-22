"use client";

/**
 * RecentContacts — Sortable table of the latest contacts
 *
 * Features:
 * - Column headers: Name, Email, Phone, Source, Date Added
 * - Click any column header to sort (asc/desc toggle)
 * - Paginated: 10 rows per page with prev/next buttons
 * - Responsive: horizontal scroll on small screens
 *
 * Props:
 *   contacts (array) - [{ id, name, email, phone, source, dateAdded }, ...]
 */

import { useState, useMemo } from "react";
import { formatDate } from "@/lib/formatters";
import clsx from "clsx";

// Column definitions for the table
const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "source", label: "Source" },
  { key: "dateAdded", label: "Date Added" },
];

const PAGE_SIZE = 10;

export default function RecentContacts({ contacts = [] }) {
  // ── Sort state ────────────────────────────────────────
  const [sortKey, setSortKey] = useState("dateAdded");
  const [sortDir, setSortDir] = useState("desc"); // "asc" or "desc"

  // ── Pagination state ──────────────────────────────────
  const [page, setPage] = useState(0);

  // Handle column header click to toggle sort
  const handleSort = (key) => {
    if (sortKey === key) {
      // Same column clicked — toggle direction
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      // New column — default to ascending
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0); // Reset to first page when sorting changes
  };

  // Sort contacts by the selected column
  const sorted = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aVal = a[sortKey] || "";
      const bVal = b[sortKey] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [contacts, sortKey, sortDir]);

  // Paginate the sorted results
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Contacts
      </h3>

      {/* Horizontal scroll wrapper for mobile responsiveness */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          {/* Column headers — clickable for sorting */}
          <thead>
            <tr className="border-b border-gray-100">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={clsx(
                    "text-left py-3 px-4 font-medium text-gray-500",
                    "cursor-pointer hover:text-gray-900 select-none",
                    "transition-colors"
                  )}
                >
                  {col.label}
                  {/* Sort indicator arrow */}
                  {sortKey === col.key && (
                    <span className="ml-1">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body — contact rows */}
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="text-center py-8 text-gray-400"
                >
                  No contacts to display
                </td>
              </tr>
            ) : (
              pageData.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{contact.email}</td>
                  <td className="py-3 px-4 text-gray-600">{contact.phone}</td>
                  <td className="py-3 px-4">
                    {/* Source badge with subtle background */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {contact.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatDate(contact.dateAdded)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                page === 0
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                page >= totalPages - 1
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

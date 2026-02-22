"use client";

/**
 * Main Dashboard Page
 *
 * This is the primary view that clients see. It:
 * 1. Fetches unified data from /api/summary on mount
 * 2. Shows a loading skeleton while data loads
 * 3. Renders a responsive grid of KPI cards, charts, and tables
 * 4. Includes the BrandingHeader and ExportButton
 *
 * Layout:
 *   ┌──────────────────────────────────────────┐
 *   │ BrandingHeader (logo, name, date range)  │
 *   ├────────┬────────┬────────┬───────────────┤
 *   │ Leads  │Pipeline│Win Rate│ Conversations │  ← MetricCards
 *   ├────────┴────────┼────────┴───────────────┤
 *   │ PipelineChart   │ LeadSourceChart        │  ← Charts row
 *   ├─────────────────┼───────────────────────-┤
 *   │ ConversionRate  │                        │
 *   ├─────────────────┴────────────────────────┤
 *   │ RecentContacts (full width table)        │  ← Table
 *   └──────────────────────────────────────────┘
 *   [Export PDF button — fixed bottom right]
 */

import { useState, useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import PipelineChart from "@/components/PipelineChart";
import LeadSourceChart from "@/components/LeadSourceChart";
import RecentContacts from "@/components/RecentContacts";
import ConversionRate from "@/components/ConversionRate";
import BrandingHeader from "@/components/BrandingHeader";
import ExportButton from "@/components/ExportButton";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";

export default function DashboardPage() {
  // ── State ───────────────────────────────────────────
  const [data, setData] = useState(null);         // API response
  const [loading, setLoading] = useState(true);    // Loading state
  const [error, setError] = useState(null);        // Error state
  const [dateRange, setDateRange] = useState("month"); // Date filter

  // ── Fetch data on mount ─────────────────────────────
  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/summary");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [dateRange]); // Re-fetch when date range changes

  // ── Loading Skeleton ────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="skeleton w-10 h-10 rounded-lg" />
            <div>
              <div className="skeleton w-40 h-5 mb-2" />
              <div className="skeleton w-56 h-4" />
            </div>
          </div>
        </div>

        {/* Skeleton body */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Metric cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dashboard-card">
                <div className="skeleton w-24 h-4 mb-3" />
                <div className="skeleton w-20 h-8 mb-2" />
                <div className="skeleton w-32 h-3" />
              </div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <div className="skeleton w-40 h-5 mb-4" />
              <div className="skeleton w-full h-64" />
            </div>
            <div className="dashboard-card">
              <div className="skeleton w-32 h-5 mb-4" />
              <div className="skeleton w-full h-64" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="dashboard-card">
            <div className="skeleton w-40 h-5 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton w-full h-10 mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => setDateRange((d) => d)} // Trigger re-fetch
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Extract data for components ─────────────────────
  const { contacts, opportunities, conversations, meta } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Branded header with agency logo and date range */}
      <BrandingHeader
        agencyName={meta?.agencyName || "Agency"}
        clientName={meta?.clientName || "Client"}
        logoUrl={process.env.NEXT_PUBLIC_AGENCY_LOGO_URL}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Dashboard content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* ── Row 1: KPI Metric Cards ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Leads"
            value={formatNumber(contacts?.total || 0)}
            change={0.12}
            icon="U"
            color="blue"
          />
          <MetricCard
            title="Pipeline Value"
            value={formatCurrency(opportunities?.totalValue || 0)}
            change={0.08}
            icon="$"
            color="emerald"
          />
          <MetricCard
            title="Win Rate"
            value={formatPercent(opportunities?.winRate || 0)}
            change={opportunities?.winRate > 0.3 ? 0.05 : -0.02}
            icon="T"
            color="amber"
          />
          <MetricCard
            title="Conversations"
            value={formatNumber(conversations?.total || 0)}
            change={0.15}
            icon="C"
            color="violet"
          />
        </div>

        {/* ── Row 2: Charts Side by Side ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineChart data={opportunities?.stageBreakdown || []} />
          <LeadSourceChart data={contacts?.sourceBreakdown || []} />
        </div>

        {/* ── Row 3: Conversion Rate Widget ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConversionRate
            winRate={opportunities?.winRate || 0}
            wonCount={opportunities?.wonCount || 0}
            lostCount={opportunities?.lostCount || 0}
            avgDealSize={opportunities?.avgDealSize || 0}
          />
          {/* Additional metrics summary */}
          <div className="lg:col-span-2 dashboard-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">New Leads (30d)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contacts?.newThisMonth || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Open Conversations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations?.openCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercent(conversations?.responseRate || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {opportunities?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(opportunities?.avgDealSize || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Closed Conversations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations?.closedCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 4: Recent Contacts Table ─────────── */}
        <RecentContacts contacts={contacts?.recentContacts || []} />
      </main>

      {/* Fixed PDF export button */}
      <ExportButton
        data={data}
        agencyName={meta?.agencyName || "Agency"}
        clientName={meta?.clientName || "Client"}
      />
    </div>
  );
}

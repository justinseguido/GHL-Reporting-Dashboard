"use client";

/**
 * ExportButton — Generates and downloads a PDF report
 *
 * Uses @react-pdf/renderer to build a branded PDF containing:
 * - Agency logo + client name header
 * - KPI metrics summary
 * - Pipeline and lead source data tables
 * - Recent contacts list
 * - Generated date and branding footer
 *
 * Props:
 *   data        (object) - The full summary data from /api/summary
 *   agencyName  (string) - Agency name for branding
 *   clientName  (string) - Client name for the report title
 */

import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// ── PDF Styles ────────────────────────────────────────
// @react-pdf/renderer uses its own style system (similar to React Native)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  dateText: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  metricLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

// ── PDF Document Component ────────────────────────────
function ReportDocument({ data, agencyName, clientName }) {
  const now = format(new Date(), "MMMM d, yyyy");
  const contacts = data?.contacts || {};
  const opps = data?.opportunities || {};
  const convos = data?.conversations || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with agency name and date */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{agencyName}</Text>
            <Text style={styles.subtitle}>
              Performance Report for {clientName}
            </Text>
          </View>
          <View>
            <Text style={styles.dateText}>Generated: {now}</Text>
          </View>
        </View>

        {/* KPI Metrics Row */}
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Leads</Text>
            <Text style={styles.metricValue}>{contacts.total || 0}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>New This Month</Text>
            <Text style={styles.metricValue}>
              {contacts.newThisMonth || 0}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Pipeline Value</Text>
            <Text style={styles.metricValue}>
              ${(opps.totalValue || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Win Rate</Text>
            <Text style={styles.metricValue}>
              {((opps.winRate || 0) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Pipeline Stages Table */}
        <Text style={styles.sectionTitle}>Pipeline Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Stage</Text>
            <Text style={styles.tableCellHeader}>Opportunities</Text>
          </View>
          {(opps.stageBreakdown || []).map((stage, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{stage.name}</Text>
              <Text style={styles.tableCell}>{stage.value}</Text>
            </View>
          ))}
        </View>

        {/* Lead Sources Table */}
        <Text style={styles.sectionTitle}>Lead Sources</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Source</Text>
            <Text style={styles.tableCellHeader}>Contacts</Text>
          </View>
          {(contacts.sourceBreakdown || []).map((source, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{source.name}</Text>
              <Text style={styles.tableCell}>{source.value}</Text>
            </View>
          ))}
        </View>

        {/* Conversations Summary */}
        <Text style={styles.sectionTitle}>Conversations</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total</Text>
            <Text style={styles.metricValue}>{convos.total || 0}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Open</Text>
            <Text style={styles.metricValue}>{convos.openCount || 0}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Response Rate</Text>
            <Text style={styles.metricValue}>
              {((convos.responseRate || 0) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {agencyName} | Confidential Report | Generated on {now}
        </Text>
      </Page>
    </Document>
  );
}

// ── Export Button Component ───────────────────────────
export default function ExportButton({
  data,
  agencyName = "Agency",
  clientName = "Client",
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Generate the PDF blob from our React component
      const blob = await pdf(
        <ReportDocument
          data={data}
          agencyName={agencyName}
          clientName={clientName}
        />
      ).toBlob();

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = format(new Date(), "yyyy-MM-dd");
      link.href = url;
      link.download = `${clientName.replace(/\s+/g, "-")}-Report-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || !data}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2 px-5 py-3
        bg-brand-600 hover:bg-brand-700 text-white
        rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-medium
      `}
    >
      {/* PDF icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {loading ? "Generating..." : "Export PDF"}
    </button>
  );
}

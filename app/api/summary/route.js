/**
 * API Route: /api/summary
 *
 * Aggregates data from all three endpoints (contacts, opportunities,
 * conversations) into a single unified metrics object.
 *
 * This is the primary endpoint the dashboard fetches on load —
 * one request instead of three, reducing client-side complexity.
 */

import { NextResponse } from "next/server";
import { getContacts, getOpportunities, getConversations, getPipelines } from "@/lib/ghl";
import { isWithinDays, groupBy } from "@/lib/formatters";

// Force dynamic rendering — never cache at build time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all data sources in parallel for maximum speed
    const [contacts, opportunities, conversations, pipelines] =
      await Promise.all([
        getContacts(),
        getOpportunities(),
        getConversations(),
        getPipelines(),
      ]);

    // ── Contact Metrics ─────────────────────────────────
    const newContacts = contacts.filter((c) =>
      isWithinDays(c.dateAdded, 30)
    ).length;

    // Lead source breakdown for pie chart
    const bySource = groupBy(contacts, "source");
    const sourceBreakdown = Object.entries(bySource).map(
      ([name, items]) => ({
        name,
        value: items.length,
      })
    );

    // 10 most recent contacts for table
    const recentContacts = contacts
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unknown",
        email: c.email || "N/A",
        phone: c.phone || "N/A",
        source: c.source || "Unknown",
        dateAdded: c.dateAdded,
        tags: c.tags || [],
      }));

    // ── Opportunity Metrics ─────────────────────────────
    // Build stage name lookup
    const stageMap = {};
    pipelines.forEach((p) => {
      (p.stages || []).forEach((s) => {
        stageMap[s.id] = s.name;
      });
    });

    const totalPipelineValue = opportunities.reduce(
      (sum, o) => sum + (o.monetaryValue || 0),
      0
    );

    // Stage breakdown for bar chart
    const stageCounts = {};
    opportunities.forEach((opp) => {
      const name = stageMap[opp.pipelineStageId] || "Unknown";
      stageCounts[name] = (stageCounts[name] || 0) + 1;
    });
    const stageBreakdown = Object.entries(stageCounts).map(
      ([name, value]) => ({ name, value })
    );

    // Win rate calculation
    const wonCount = opportunities.filter((o) => o.status === "won").length;
    const lostCount = opportunities.filter((o) => o.status === "lost").length;
    const closedTotal = wonCount + lostCount;
    const winRate = closedTotal > 0 ? wonCount / closedTotal : 0;

    // Average deal size
    const withValue = opportunities.filter((o) => o.monetaryValue > 0);
    const avgDealSize =
      withValue.length > 0
        ? withValue.reduce((s, o) => s + o.monetaryValue, 0) / withValue.length
        : 0;

    // ── Conversation Metrics ────────────────────────────
    const openConversations = conversations.filter(
      (c) => c.unreadCount > 0 || c.status === "open"
    ).length;

    const withReply = conversations.filter(
      (c) => c.lastMessageType === "TYPE_OUTBOUND"
    ).length;
    const responseRate =
      conversations.length > 0 ? withReply / conversations.length : 0;

    // ── Unified Response ────────────────────────────────
    return NextResponse.json({
      contacts: {
        total: contacts.length,
        newThisMonth: newContacts,
        sourceBreakdown,
        recentContacts,
      },
      opportunities: {
        total: opportunities.length,
        totalValue: totalPipelineValue,
        stageBreakdown,
        winRate,
        wonCount,
        lostCount,
        avgDealSize,
      },
      conversations: {
        total: conversations.length,
        openCount: openConversations,
        closedCount: conversations.length - openConversations,
        responseRate,
      },
      // Meta information for display
      meta: {
        generatedAt: new Date().toISOString(),
        locationId: process.env.GHL_LOCATION_ID,
        agencyName: process.env.AGENCY_NAME,
        clientName: process.env.CLIENT_NAME,
      },
    });
  } catch (error) {
    console.error("[/api/summary] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch summary", details: error.message },
      { status: 500 }
    );
  }
}

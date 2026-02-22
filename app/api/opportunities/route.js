/**
 * API Route: /api/opportunities
 *
 * Fetches pipeline opportunities from GoHighLevel and returns:
 * - Total pipeline value (sum of all monetary values)
 * - Count of opportunities per pipeline stage
 * - Win rate (won / total closed)
 * - Average deal size
 */

import { NextResponse } from "next/server";
import { getOpportunities, getPipelines } from "@/lib/ghl";

// Force dynamic rendering — never cache at build time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch opportunities and pipeline definitions in parallel
    const [opportunities, pipelines] = await Promise.all([
      getOpportunities(),
      getPipelines(),
    ]);

    // Build a lookup map: stageId → stageName for human-readable labels
    const stageMap = {};
    pipelines.forEach((pipeline) => {
      (pipeline.stages || []).forEach((stage) => {
        stageMap[stage.id] = stage.name;
      });
    });

    // Calculate total pipeline value across all opportunities
    const totalValue = opportunities.reduce(
      (sum, opp) => sum + (opp.monetaryValue || 0),
      0
    );

    // Count opportunities grouped by their pipeline stage
    const stageCount = {};
    opportunities.forEach((opp) => {
      const stageName =
        stageMap[opp.pipelineStageId] || opp.pipelineStageId || "Unknown";
      stageCount[stageName] = (stageCount[stageName] || 0) + 1;
    });

    // Convert stage counts into chart-ready array
    const stageBreakdown = Object.entries(stageCount).map(
      ([name, count]) => ({
        name,
        value: count,
      })
    );

    // Calculate win rate: won opportunities / total closed opportunities
    const wonCount = opportunities.filter(
      (o) => o.status === "won"
    ).length;
    const lostCount = opportunities.filter(
      (o) => o.status === "lost"
    ).length;
    const closedTotal = wonCount + lostCount;
    const winRate = closedTotal > 0 ? wonCount / closedTotal : 0;

    // Average deal size (only from opportunities with a monetary value)
    const withValue = opportunities.filter((o) => o.monetaryValue > 0);
    const avgDealSize =
      withValue.length > 0
        ? withValue.reduce((s, o) => s + o.monetaryValue, 0) / withValue.length
        : 0;

    return NextResponse.json({
      total: opportunities.length,
      totalValue,
      stageBreakdown,
      winRate,
      wonCount,
      lostCount,
      avgDealSize,
    });
  } catch (error) {
    console.error("[/api/opportunities] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch opportunities", details: error.message },
      { status: 500 }
    );
  }
}

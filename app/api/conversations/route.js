/**
 * API Route: /api/conversations
 *
 * Fetches conversation threads from GoHighLevel and returns:
 * - Total conversation count
 * - Open vs. closed breakdown
 * - Response rate (conversations with at least one reply / total)
 * - Recent conversations list
 */

import { NextResponse } from "next/server";
import { getConversations } from "@/lib/ghl";
import { isWithinDays } from "@/lib/formatters";

// Force dynamic rendering — never cache at build time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all conversations from GHL
    const conversations = await getConversations();

    // Count open vs. closed conversations
    // GHL uses "read" status field — unread implies open/active
    const openCount = conversations.filter(
      (c) => c.unreadCount > 0 || c.status === "open"
    ).length;
    const closedCount = conversations.length - openCount;

    // Count conversations from the last 30 days
    const recentCount = conversations.filter((c) =>
      isWithinDays(c.lastMessageDate || c.dateAdded, 30)
    ).length;

    // Response rate: conversations where the business sent at least one reply
    // GHL tracks lastMessageType — "TYPE_OUTBOUND" means the business replied
    const withReply = conversations.filter(
      (c) => c.lastMessageType === "TYPE_OUTBOUND"
    ).length;
    const responseRate =
      conversations.length > 0 ? withReply / conversations.length : 0;

    return NextResponse.json({
      total: conversations.length,
      openCount,
      closedCount,
      recentCount,
      responseRate,
    });
  } catch (error) {
    console.error("[/api/conversations] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch conversations", details: error.message },
      { status: 500 }
    );
  }
}

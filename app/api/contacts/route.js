/**
 * API Route: /api/contacts
 *
 * Fetches contacts from GoHighLevel and returns:
 * - Total contact count
 * - New contacts added in the last 30 days
 * - Breakdown by lead source (for pie chart)
 * - Most recent 10 contacts (for table display)
 */

import { NextResponse } from "next/server";
import { getContacts } from "@/lib/ghl";
import { isWithinDays, groupBy } from "@/lib/formatters";

// Force dynamic rendering — never cache at build time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all contacts from GHL for this location
    const contacts = await getContacts();

    // Count contacts added in the last 30 days
    const newThisMonth = contacts.filter((c) =>
      isWithinDays(c.dateAdded, 30)
    ).length;

    // Group contacts by their source field for lead source chart
    const bySource = groupBy(contacts, "source");
    const sourceBreakdown = Object.entries(bySource).map(
      ([source, items]) => ({
        name: source,
        value: items.length,
      })
    );

    // Get the 10 most recently added contacts for the table
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

    return NextResponse.json({
      total: contacts.length,
      newThisMonth,
      sourceBreakdown,
      recentContacts,
    });
  } catch (error) {
    console.error("[/api/contacts] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch contacts", details: error.message },
      { status: 500 }
    );
  }
}

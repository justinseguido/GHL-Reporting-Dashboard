/**
 * GoHighLevel API Client
 *
 * Centralized HTTP client for all GHL API interactions.
 * Uses axios with pre-configured auth headers and base URL.
 * All functions include pagination support for large datasets.
 */

import axios from "axios";

// ── Axios instance with GHL defaults ──────────────────
const ghlClient = axios.create({
  baseURL: process.env.GHL_BASE_URL || "https://rest.gohighlevel.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s timeout to prevent hanging requests
});

// ── Response interceptor for consistent error handling ─
ghlClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`[GHL API Error] ${status}: ${message}`);
    throw new Error(`GHL API Error (${status}): ${message}`);
  }
);

/**
 * Fetch all pages from a paginated GHL endpoint.
 * GHL returns { contacts: [...], meta: { total, nextPageUrl } }
 *
 * @param {string} endpoint - The API path (e.g., "/contacts")
 * @param {string} dataKey - The key in the response containing the array
 * @param {object} params  - Query parameters to send
 * @returns {Array} - All items across all pages
 */
async function fetchAllPages(endpoint, dataKey, params = {}) {
  const allItems = [];
  let startAfterId = null;
  let hasMore = true;

  while (hasMore) {
    // Build query params — GHL uses startAfterId for cursor-based pagination
    const queryParams = {
      locationId: process.env.GHL_LOCATION_ID,
      limit: 100,
      ...params,
      ...(startAfterId ? { startAfterId } : {}),
    };

    const response = await ghlClient.get(endpoint, { params: queryParams });
    const items = response[dataKey] || [];
    allItems.push(...items);

    // Check if there are more pages
    if (items.length > 0 && response.meta?.nextPageUrl) {
      // Extract the startAfterId from the last item for next page
      startAfterId = items[items.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

// ── Exported API Functions ────────────────────────────

/**
 * Fetch all contacts for the configured location.
 * Returns array of contact objects with name, email, phone, source, etc.
 */
export async function getContacts() {
  return fetchAllPages("/contacts", "contacts");
}

/**
 * Fetch all opportunities (deals) across all pipelines.
 * Each opportunity has: name, status, monetaryValue, pipelineStageId, etc.
 */
export async function getOpportunities() {
  return fetchAllPages("/opportunities/search", "opportunities", {
    location_id: process.env.GHL_LOCATION_ID,
  });
}

/**
 * Fetch recent conversations (messages/threads).
 * Each conversation has: type, contactId, lastMessageDate, status, etc.
 */
export async function getConversations() {
  return fetchAllPages("/conversations/search", "conversations", {
    locationId: process.env.GHL_LOCATION_ID,
  });
}

/**
 * Fetch all pipelines for the location.
 * Each pipeline contains stages with names and IDs for mapping opportunities.
 */
export async function getPipelines() {
  const response = await ghlClient.get("/pipelines", {
    params: { locationId: process.env.GHL_LOCATION_ID },
  });
  return response.pipelines || [];
}

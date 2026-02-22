/**
 * GoHighLevel API v2.0 Client
 *
 * Uses the Private Integration auth model (API v2.0).
 * Base URL: https://services.leadconnectorhq.com
 * Auth: Bearer token from Private Integration API key
 *
 * Key v2 changes from v1:
 * - New base URL (leadconnectorhq.com instead of rest.gohighlevel.com)
 * - Contacts use POST /contacts/search instead of GET /contacts
 * - Opportunities use POST /opportunities/search with body params
 * - Conversations use GET /conversations/search with query params
 * - Pipelines use GET /opportunities/pipelines
 * - Required "Version" header for API versioning
 */

import axios from "axios";

// ── Axios instance configured for GHL API v2 ─────────
const ghlClient = axios.create({
  baseURL: process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com",
  headers: {
    // Private Integration API key as Bearer token
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    // Required v2 version header
    Version: "2021-07-28",
  },
  timeout: 15000,
});

// ── Response interceptor for consistent error handling ─
ghlClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.response?.data?.msg || error.message;
    console.error(`[GHL API v2 Error] ${status}: ${message}`);
    throw new Error(`GHL API Error (${status}): ${message}`);
  }
);

/**
 * Fetch all pages from a paginated GHL v2 POST endpoint.
 *
 * v2 search endpoints (contacts, opportunities) use POST with body params.
 * Pagination is page-based: { page: 1, limit: 100 }
 *
 * @param {string} endpoint - The API path
 * @param {string} dataKey  - Key in response containing the data array
 * @param {object} body     - Additional POST body params
 * @returns {Array} - All items across all pages
 */
async function fetchAllPagesPost(endpoint, dataKey, body = {}) {
  const allItems = [];
  let page = 1;
  let hasMore = true;
  const locationId = process.env.GHL_LOCATION_ID;

  while (hasMore) {
    const requestBody = {
      locationId,
      page,
      limit: 100,
      ...body,
    };

    const response = await ghlClient.post(endpoint, requestBody);
    const items = response[dataKey] || [];
    allItems.push(...items);

    // v2 returns meta.total — stop when we've collected all items
    const total = response.meta?.total ?? response.total ?? 0;
    if (allItems.length >= total || items.length === 0) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allItems;
}

/**
 * Fetch all pages from a GET endpoint with cursor-based pagination.
 * Used for conversations and other GET-based v2 endpoints.
 */
async function fetchAllPagesGet(endpoint, dataKey, params = {}) {
  const allItems = [];
  let startAfterId = null;
  let hasMore = true;
  const locationId = process.env.GHL_LOCATION_ID;

  while (hasMore) {
    const queryParams = {
      locationId,
      limit: 100,
      ...params,
      ...(startAfterId ? { startAfterId } : {}),
    };

    const response = await ghlClient.get(endpoint, { params: queryParams });
    const items = response[dataKey] || [];
    allItems.push(...items);

    // Check for more pages via nextPage token or item count
    if (
      items.length > 0 &&
      (response.meta?.nextPageUrl || response.meta?.nextPage)
    ) {
      startAfterId = items[items.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

// ── Exported API Functions (v2 endpoints) ─────────────

/**
 * Search contacts for the configured location.
 * v2 endpoint: POST /contacts/search
 */
export async function getContacts() {
  return fetchAllPagesPost("/contacts/search", "contacts");
}

/**
 * Search opportunities across all pipelines.
 * v2 endpoint: POST /opportunities/search
 */
export async function getOpportunities() {
  return fetchAllPagesPost("/opportunities/search", "opportunities");
}

/**
 * Fetch conversations for the location.
 * v2 endpoint: GET /conversations/search
 */
export async function getConversations() {
  return fetchAllPagesGet("/conversations/search", "conversations");
}

/**
 * Fetch all pipelines for the location.
 * v2 endpoint: GET /opportunities/pipelines
 */
export async function getPipelines() {
  const response = await ghlClient.get("/opportunities/pipelines", {
    params: { locationId: process.env.GHL_LOCATION_ID },
  });
  return response.pipelines || [];
}

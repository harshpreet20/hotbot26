/**
 * Google Analytics 4 Data API client using direct REST (no npm package).
 * Uses service account JWT auth with Node.js built-in crypto.
 */
import crypto from "crypto";

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export function isGa4Enabled(): boolean {
  return !!(process.env.GA4_SERVICE_ACCOUNT_JSON && process.env.GA4_PROPERTY_ID);
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_JSON is not set");
  return JSON.parse(raw) as ServiceAccount;
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (tokenCache && tokenCache.expiresAt > now + 60) {
    return tokenCache.accessToken;
  }

  const sa = getServiceAccount();
  const iat = now;
  const exp = now + 3600;

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp,
    })
  );

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  sign.end();
  const signature = base64UrlEncode(sign.sign(sa.private_key));
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 token exchange failed: ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) - 300, // cache for 55 min
  };

  return tokenCache.accessToken;
}

async function runReport(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is not set");

  const token = await getAccessToken();
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 runReport failed: ${text}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

function dateRange(days: number): { startDate: string; endDate: string }[] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return [
    {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    },
  ];
}

interface DimensionHeader { name: string }
interface MetricHeader { name: string; type: string }
interface DimensionValue { value: string }
interface MetricValue { value: string }
interface Row {
  dimensionValues?: DimensionValue[];
  metricValues?: MetricValue[];
}
interface ReportResponse {
  dimensionHeaders?: DimensionHeader[];
  metricHeaders?: MetricHeader[];
  rows?: Row[];
}

function parseRows(data: Record<string, unknown>): Row[] {
  const report = data as ReportResponse;
  return report.rows ?? [];
}

// ── Named report helpers ────────────────────────────────────────────────────

export interface OverviewMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
}

export async function getOverviewMetrics(days = 30): Promise<OverviewMetrics> {
  const data = await runReport({
    dateRanges: dateRange(days),
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "newUsers" },
    ],
  });

  const rows = parseRows(data);
  const mv = rows[0]?.metricValues ?? [];

  return {
    sessions: parseInt(mv[0]?.value ?? "0", 10),
    users: parseInt(mv[1]?.value ?? "0", 10),
    pageviews: parseInt(mv[2]?.value ?? "0", 10),
    bounceRate: parseFloat(mv[3]?.value ?? "0"),
    avgSessionDuration: parseFloat(mv[4]?.value ?? "0"),
    newUsers: parseInt(mv[5]?.value ?? "0", 10),
  };
}

export interface SessionsByDate {
  date: string;
  sessions: number;
}

export async function getSessionsByDate(days = 30): Promise<SessionsByDate[]> {
  const data = await runReport({
    dateRanges: dateRange(days),
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return parseRows(data).map((row) => ({
    date: row.dimensionValues?.[0]?.value ?? "",
    sessions: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
  }));
}

export interface TopPage {
  page: string;
  sessions: number;
  bounceRate: number;
}

export async function getTopPages(days = 30, limit = 10): Promise<TopPage[]> {
  const data = await runReport({
    dateRanges: dateRange(days),
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "sessions" }, { name: "bounceRate" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });

  return parseRows(data).map((row) => ({
    page: row.dimensionValues?.[0]?.value ?? "",
    sessions: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
    bounceRate: parseFloat(row.metricValues?.[1]?.value ?? "0"),
  }));
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

export async function getTrafficSources(days = 30): Promise<TrafficSource[]> {
  const data = await runReport({
    dateRanges: dateRange(days),
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  const rows = parseRows(data);
  const total = rows.reduce((s, r) => s + parseInt(r.metricValues?.[0]?.value ?? "0", 10), 0);

  return rows.map((row) => {
    const sessions = parseInt(row.metricValues?.[0]?.value ?? "0", 10);
    return {
      source: row.dimensionValues?.[0]?.value ?? "(none)",
      sessions,
      percentage: total > 0 ? Math.round((sessions / total) * 100) : 0,
    };
  });
}

export interface DeviceBreakdown {
  device: string;
  sessions: number;
  percentage: number;
}

export async function getDeviceBreakdown(days = 30): Promise<DeviceBreakdown[]> {
  const data = await runReport({
    dateRanges: dateRange(days),
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  const rows = parseRows(data);
  const total = rows.reduce((s, r) => s + parseInt(r.metricValues?.[0]?.value ?? "0", 10), 0);

  return rows.map((row) => {
    const sessions = parseInt(row.metricValues?.[0]?.value ?? "0", 10);
    return {
      device: row.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions,
      percentage: total > 0 ? Math.round((sessions / total) * 100) : 0,
    };
  });
}

export interface EventCount {
  eventName: string;
  count: number;
}

export async function getEventCounts(days = 30): Promise<EventCount[]> {
  const data = await runReport({
    dateRanges: dateRange(days),
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 20,
  });

  return parseRows(data).map((row) => ({
    eventName: row.dimensionValues?.[0]?.value ?? "",
    count: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
  }));
}

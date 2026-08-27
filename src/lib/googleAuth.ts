import { google } from "googleapis";
import { readAll, updateById, insert } from "@/lib/store";

export interface GoogleToken {
  id: string;          // = dashboardUserId
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
  email?: string;
  updatedAt: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getAuthUrl(state: string): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  });
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
  email: string;
}> {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();

  return {
    accessToken:  tokens.access_token!,
    refreshToken: tokens.refresh_token!,
    expiryDate:   tokens.expiry_date!,
    scope:        tokens.scope ?? SCOPES.join(" "),
    email:        data.email ?? "",
  };
}

export async function getAuthedClient(userId: string) {
  const all = await readAll<GoogleToken>("google_tokens");
  const token = all.find((t) => t.id === userId);
  if (!token?.refreshToken) return null;

  const client = createOAuth2Client();
  client.setCredentials({
    access_token:  token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date:   token.expiryDate,
  });

  // Auto-refresh if about to expire (< 5 min left)
  if (token.expiryDate < Date.now() + 300_000) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
    await updateById<GoogleToken>("google_tokens", userId, {
      ...token,
      accessToken: credentials.access_token ?? token.accessToken,
      expiryDate:  credentials.expiry_date  ?? token.expiryDate,
      updatedAt:   new Date().toISOString(),
    });
  }

  return client;
}

export async function saveGoogleToken(
  userId: string,
  data: { accessToken: string; refreshToken: string; expiryDate: number; scope: string; email: string },
) {
  const all = await readAll<GoogleToken>("google_tokens");
  const existing = all.find((t) => t.id === userId);
  const record: GoogleToken = {
    id:           userId,
    accessToken:  data.accessToken,
    refreshToken: data.refreshToken,
    expiryDate:   data.expiryDate,
    scope:        data.scope,
    email:        data.email,
    updatedAt:    new Date().toISOString(),
  };
  if (existing) {
    await updateById<GoogleToken>("google_tokens", userId, record);
  } else {
    await insert<GoogleToken>("google_tokens", record);
  }
}

export async function revokeGoogleToken(userId: string) {
  const all = await readAll<GoogleToken>("google_tokens");
  const token = all.find((t) => t.id === userId);
  if (!token) return;
  const client = createOAuth2Client();
  try { await client.revokeToken(token.accessToken); } catch { /* ignore if already expired */ }
  const { removeById } = await import("@/lib/store");
  await removeById("google_tokens", userId);
}

export async function getGoogleTokenRecord(userId: string): Promise<GoogleToken | null> {
  const all = await readAll<GoogleToken>("google_tokens");
  return all.find((t) => t.id === userId) ?? null;
}

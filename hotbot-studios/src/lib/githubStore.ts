/**
 * Optional GitHub persistence layer for posts.json.
 *
 * When GITHUB_TOKEN is set this module commits the updated posts.json back to
 * the repository after every write.  Vercel detects the commit, auto-deploys,
 * and bakes the file into the next cold-start bundle — making post data fully
 * persistent with zero extra infrastructure.
 *
 * Required env var:
 *   GITHUB_TOKEN  — classic PAT with "repo" scope (or a fine-grained token
 *                   with "Contents: Read and Write" on this repository)
 *
 * Optional env vars (auto-detected from the repo if omitted):
 *   GITHUB_REPO         — e.g. "harshpreet20/hotbot26"   (default: auto)
 *   GITHUB_BRANCH       — branch Vercel deploys from      (default: "main")
 *   GITHUB_POSTS_PATH   — path inside the repo            (default: "hotbot-studios/public/data/posts.json")
 */

const TOKEN      = process.env.GITHUB_TOKEN;
const REPO       = process.env.GITHUB_REPO       || "harshpreet20/hotbot26";
const BRANCH     = process.env.GITHUB_BRANCH     || "main";
const FILE_PATH  = process.env.GITHUB_POSTS_PATH || "hotbot-studios/public/data/posts.json";

const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

const HEADERS = () => ({
  Authorization:  `Bearer ${TOKEN}`,
  Accept:         "application/vnd.github+json",
  "Content-Type": "application/json",
  "User-Agent":   "HotBot-Backdrop/1.0",
  "X-GitHub-Api-Version": "2022-11-28",
});

/** Commit the given JSON string as posts.json to the repository. Fire-and-forget safe. */
export async function commitPostsToGitHub(jsonContent: string): Promise<void> {
  if (!TOKEN) return; // No token configured — skip silently

  try {
    // 1. Fetch the current file to get its SHA (required for updates)
    let sha: string | undefined;
    const getRes = await fetch(`${API_URL}?ref=${BRANCH}`, { headers: HEADERS() });
    if (getRes.ok) {
      const existing = await getRes.json() as { sha?: string };
      sha = existing.sha;
    }

    // 2. PUT the new content (base64-encoded)
    const body: Record<string, string> = {
      message: "chore(posts): sync posts.json from Backdrop",
      content: Buffer.from(jsonContent).toString("base64"),
      branch:  BRANCH,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(API_URL, {
      method:  "PUT",
      headers: HEADERS(),
      body:    JSON.stringify(body),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      console.error("[githubStore] commit failed:", putRes.status, err);
    }
  } catch (e) {
    console.error("[githubStore] unexpected error:", e);
  }
}

/**
 * Fetch the raw posts.json from GitHub.
 * Used on cold starts when /tmp is empty but we want the latest committed data
 * (e.g. if the last deploy pre-dates a recently committed post).
 */
export async function fetchPostsFromGitHub(): Promise<string | null> {
  if (!TOKEN) return null;
  try {
    const res = await fetch(`${API_URL}?ref=${BRANCH}`, { headers: HEADERS() });
    if (!res.ok) return null;
    const data = await res.json() as { content?: string; encoding?: string };
    if (data.encoding === "base64" && data.content) {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

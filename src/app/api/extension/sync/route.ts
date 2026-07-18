import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Extension Sync API
 * Receives prospects/clips from the Chrome extension and stores them.
 * Since this CRM uses localStorage for most features (no auth required),
 * this endpoint acts as a bridge — it validates the data and returns
 * a confirmation. The actual storage happens client-side via the
 * extension's content script injecting into the CRM domain's localStorage.
 *
 * POST /api/extension/sync — receive clips from extension
 * GET  /api/extension/sync — health check / connection test
 */

// Connection test — extension pings this to verify CRM is reachable
export async function GET() {
  return Response.json({
    ok: true,
    app: "LocalRank CRM",
    version: "2.0",
    module: "Radar",
    timestamp: new Date().toISOString(),
    capabilities: ["clips", "prospects", "tags", "folders", "ai-analysis"],
  });
}

// Receive data from extension
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data, apiKey } = body;

    // API key validation — if the environment has a key configured, enforce it
    const expectedKey = process.env.EXTENSION_API_KEY || "";
    if (expectedKey && apiKey !== expectedKey) {
      return Response.json(
        { ok: false, error: "Invalid or missing API key", code: "unauthorized" },
        { status: 401 }
      );
    }

    switch (action) {
      case "sync_clip": {
        // Validate clip structure
        if (!data || !data.url) {
          return Response.json(
            { ok: false, error: "Missing required field: url" },
            { status: 400 }
          );
        }
        const clip = {
          id: data.id || Date.now().toString(),
          url: data.url,
          title: data.title || "",
          company: data.company || "",
          phones: data.phones || [],
          emails: data.emails || [],
          socials: data.socials || {},
          category: data.category || "General",
          score: data.score || 0,
          tags: data.tags || [],
          folderId: data.folderId || "rf1",
          notes: data.notes || "",
          source: "extension",
          savedAt: data.savedAt || new Date().toISOString(),
          syncedAt: new Date().toISOString(),
        };
        return Response.json({ ok: true, action: "clip_received", clip });
      }

      case "sync_batch": {
        // Receive multiple clips at once
        if (!Array.isArray(data)) {
          return Response.json(
            { ok: false, error: "data must be an array for sync_batch" },
            { status: 400 }
          );
        }
        const synced = data.map((item: Record<string, unknown>) => ({
          id: item.id || Date.now().toString(),
          syncedAt: new Date().toISOString(),
        }));
        return Response.json({ ok: true, action: "batch_received", count: synced.length, synced });
      }

      case "ping": {
        return Response.json({ ok: true, action: "pong" });
      }

      default:
        return Response.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    return Response.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}

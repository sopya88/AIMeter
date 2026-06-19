import { NextRequest, NextResponse } from "next/server";

// ── Types ────────────────────────────────────────────────────────────────────
interface UsagePayload {
  prompt_tokens:      number;
  completion_tokens:  number;
  total_tokens?:      number;
}

interface IngestEvent {
  customerId: string;
  model:      string;
  provider:   string;
  fine_tuned?: boolean;
  created?:   number;
  usage:      UsagePayload;
}

// ── Validation ───────────────────────────────────────────────────────────────
function validate(body: unknown): { ok: true; event: IngestEvent } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;

  if (!b.customerId || typeof b.customerId !== "string")  return { ok: false, error: "customerId (string) is required" };
  if (!b.model      || typeof b.model      !== "string")  return { ok: false, error: "model (string) is required" };
  if (!b.provider   || typeof b.provider   !== "string")  return { ok: false, error: "provider (string) is required" };
  if (!b.usage      || typeof b.usage      !== "object")  return { ok: false, error: "usage (object) is required" };

  const u = b.usage as Record<string, unknown>;
  if (typeof u.prompt_tokens     !== "number") return { ok: false, error: "usage.prompt_tokens (number) is required" };
  if (typeof u.completion_tokens !== "number") return { ok: false, error: "usage.completion_tokens (number) is required" };

  const event: IngestEvent = {
    customerId: b.customerId,
    model:      b.model,
    provider:   b.provider,
    fine_tuned: typeof b.fine_tuned === "boolean" ? b.fine_tuned : false,
    created:    typeof b.created    === "number"  ? b.created    : Math.floor(Date.now() / 1000),
    usage: {
      prompt_tokens:     u.prompt_tokens     as number,
      completion_tokens: u.completion_tokens as number,
      total_tokens:      typeof u.total_tokens === "number"
        ? u.total_tokens
        : (u.prompt_tokens as number) + (u.completion_tokens as number),
    },
  };

  return { ok: true, event };
}

// ── Auth ─────────────────────────────────────────────────────────────────────
function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  // In production, look up token in DB. For now accept any non-empty token.
  return token.length > 0;
}

// ── In-memory store (dev only — swap for Postgres insert in production) ──────
const eventLog: (IngestEvent & { id: string; receivedAt: string })[] = [];

// ── POST /api/ingest ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized — provide Authorization: Bearer {API_KEY}" },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Validate
  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // 4. Persist — TODO: replace with real DB insert
  //    e.g. await db.query(`INSERT INTO usage_events (...) VALUES (...)`)
  const stored = {
    id:         `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    ...result.event,
  };
  eventLog.push(stored);

  // 5. Respond
  return NextResponse.json(
    {
      eventId:    stored.id,
      receivedAt: stored.receivedAt,
      meters: {
        input_tokens:  stored.usage.prompt_tokens,
        output_tokens: stored.usage.completion_tokens,
        total_tokens:  stored.usage.total_tokens,
        api_requests:  1,
      },
    },
    { status: 202 }
  );
}

// ── GET /api/ingest — return recent events (dev only) ────────────────────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ count: eventLog.length, events: eventLog.slice(-50) });
}

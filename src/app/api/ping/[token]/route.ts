import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/ping/:token
// The final step in any Zapier Zap hits this URL.
// We record the ping and update last_ping on the monitor.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Look up the monitor by token
  const { data: monitor, error } = await supabase
    .from("monitors")
    .select("id")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  // Update last_ping and clear alerted_at (monitor is alive again)
  await supabase
    .from("monitors")
    .update({ last_ping: now, alerted_at: null })
    .eq("id", monitor.id);

  // Insert ping record for history
  await supabase.from("pings").insert({ monitor_id: monitor.id });

  return NextResponse.json({ ok: true, received_at: now });
}

// GET works too — makes testing in a browser easy
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  return POST(req, context);
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendFlatlineAlert } from "@/lib/email";

// GET /api/cron
// Called by Render's cron job every hour.
// Checks all active monitors and sends alerts for any that have gone silent.
export async function GET(req: NextRequest) {
  // Protect the endpoint with a shared secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // Fetch all active monitors
  const { data: monitors, error } = await supabase
    .from("monitors")
    .select("id, name, user_id, threshold, last_ping, alerted_at")
    .eq("is_active", true);

  if (error) {
    console.error("Cron: failed to fetch monitors", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const alerted: string[] = [];

  for (const monitor of monitors ?? []) {
    const thresholdMs = monitor.threshold * 60 * 1000;
    const lastPingDate = monitor.last_ping ? new Date(monitor.last_ping) : null;

    // Determine if monitor has exceeded its threshold
    const isFlat =
      !lastPingDate ||
      now.getTime() - lastPingDate.getTime() > thresholdMs;

    if (!isFlat) continue;

    // Avoid re-alerting within the same threshold window
    if (monitor.alerted_at) {
      const alreadyAlertedRecently =
        now.getTime() - new Date(monitor.alerted_at).getTime() < thresholdMs;
      if (alreadyAlertedRecently) continue;
    }

    // Get user email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(
      monitor.user_id
    );
    const email = userData?.user?.email;
    if (!email) continue;

    try {
      await sendFlatlineAlert({
        to: email,
        monitorName: monitor.name,
        lastPing: monitor.last_ping,
        thresholdMinutes: monitor.threshold,
      });

      // Record that we alerted
      await supabase
        .from("monitors")
        .update({ alerted_at: now.toISOString() })
        .eq("id", monitor.id);

      alerted.push(monitor.name);
    } catch (err) {
      console.error(`Cron: failed to alert for monitor ${monitor.id}`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: monitors?.length ?? 0,
    alerted: alerted.length,
    alerted_names: alerted,
  });
}

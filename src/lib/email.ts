import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://flatline.so";
const FROM = "Flatline <alerts@getflatline.com>";

export async function sendFlatlineAlert({
  to,
  monitorName,
  lastPing,
  thresholdMinutes,
}: {
  to: string;
  monitorName: string;
  lastPing: string | null;
  thresholdMinutes: number;
}) {
  const hours = Math.round(thresholdMinutes / 60);
  const lastPingText = lastPing
    ? new Date(lastPing).toUTCString()
    : "never";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔴 Flatline: "${monitorName}" hasn't run in ${hours}h`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0A0A;color:#EDEDED;border-radius:8px">
        <div style="font-size:22px;font-weight:700;color:#FF2D55;margin-bottom:8px">⚡ Flatline Alert</div>
        <div style="font-size:16px;margin-bottom:24px;color:#EDEDED">
          Your automation <strong style="color:#fff">"${monitorName}"</strong> hasn't fired in over <strong style="color:#fff">${hours} hour${hours !== 1 ? "s" : ""}</strong>.
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr>
            <td style="padding:8px 0;color:#6B6B6B;border-bottom:1px solid #1F1F1F">Last ping received</td>
            <td style="padding:8px 0;text-align:right;border-bottom:1px solid #1F1F1F">${lastPingText}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6B6B6B">Alert threshold</td>
            <td style="padding:8px 0;text-align:right">${hours}h silence</td>
          </tr>
        </table>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#FF2D55;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px">
          View Dashboard →
        </a>
        <div style="margin-top:32px;font-size:12px;color:#6B6B6B">
          Monitored by <a href="${APP_URL}" style="color:#6B6B6B">Flatline</a> ·
          <a href="${APP_URL}/dashboard" style="color:#6B6B6B">Manage alerts</a>
        </div>
      </div>
    `,
  });
}

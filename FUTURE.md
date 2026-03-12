# Flatline — Future Roadmap

This file tracks features to add after the core v1 is live and people are using it.
Don't build these until real users ask for them.

---

## PRIORITY ORDER

### Week 4 (right after launch — first update)
These two are low effort, high signal. Build them as soon as the first users are in.

**1. Dual-ping — Trigger vs Completion monitoring**
- Give each monitor two URLs: a start ping and an end ping
- User drops the start URL at the top of their automation, end URL at the bottom
- If start fires but end doesn't, Flatline alerts: "Your automation is triggering but not finishing — a filter or error is blocking the end"
- Solves the biggest false-flatline problem: filters that correctly stop a run look like a dead automation
- Database change: add a `start_token` column to monitors, track start pings separately
- Why now: users will hit this within days of using the product. Better to ship it before they complain.

**2. Auto-threshold suggestions**
- After 10 pings on any monitor, calculate the average run interval
- Surface a suggestion on the dashboard: "This automation usually runs every 12 min — want us to alert after 20?"
- One-click to accept, dismiss otherwise
- Data is already there (pings table has timestamps) — this is mostly UI work
- Why now: new users guess their threshold wrong. This removes that friction and makes the product feel smart.

---

### Month 2 (once you have 50+ active users)

**3. Public status page**
- Each monitor gets a shareable URL: flatline.so/status/[token]
- Shows live status, last ping time, uptime history
- No login required to view
- Users share it with clients to prove their automations are healthy
- Natural paid feature — include in Pro tier
- Why then: not urgent until users have clients they want to impress

---

## Level 2 — Slowdown Detection
- Track run volume per monitor over time (already stored in `pings` table)
- Alert when volume drops significantly vs. 7-day rolling average
- "Your Zap normally runs 50x/day. Today: 3."
- Use case: the Zap is running but something upstream is broken (fewer form submissions, filter matching nothing)

## Level 3 — Bad Data Detection
- Let users send a payload with each ping: `POST /api/ping/:token` with JSON body
- Flatline stores the payload fields and types
- Alert when expected fields are missing or null
- "Your Zap ran but the email field has been empty for 12 runs"

## Multi-tool support
- Write guides for Make (Integromat), n8n, Power Automate, Pabbly, Activepieces
- Same webhook approach — zero integration work needed, just documentation
- SEO play: "How to monitor your Make scenarios with Flatline"

## Slack alerts
- Connect Slack workspace
- Send alerts to a channel instead of (or in addition to) email
- High-demand feature for teams — drives team-level adoption

## Team / multi-user
- Invite teammates to a workspace
- Shared monitor dashboard
- Role-based alert routing (ops gets order alerts, dev gets API alerts)

## Alert escalation
- First alert: email
- No acknowledgement after 1h: Slack message
- No acknowledgement after 2h: SMS (via Twilio)

## Monitor groups / tags
- Group monitors by tool, team, or project
- Filter dashboard by group

## Zapier integration (native)
- Build a Zapier app so users can add the Flatline ping step without using raw webhooks
- Makes setup even simpler — one click instead of copying a URL

## Billing
- Free tier: 3 monitors, email only, 1h check interval
- Pro ($9/mo): unlimited monitors, Slack alerts, 5-minute check interval
- Team ($29/mo): multi-user, escalation, payload inspection

## Public status page
- Each monitor gets a shareable status page
- "Is [your automation] running?" — shareable with clients or teammates

## Mobile app
- Push notifications for flatline alerts
- Simpler than email for on-the-go users

## API
- Programmatic monitor creation/deletion
- Useful for devs who deploy automations as part of CI/CD

---

## Known Technical Debt (fix before scaling)
- [ ] Cron job: batch the `getUserById` calls instead of one per monitor
- [ ] Add rate limiting to the ping endpoint (prevent abuse)
- [ ] Add a `monitors` count limit per user on the free tier (enforce in API)
- [ ] Add email verification check before allowing dashboard access

#by me 
**Recommendation for rebuilding Flatline into a serious product**

**Goal:**
Transform from *simple ping monitor* → **Automation Reliability / Observability Platform** for tools like Zapier, Make, n8n, and Microsoft Power Automate.

---

**Product Changes**

1. **Automation Health Dashboard**

   * Display per-workflow metrics: status, last event, expected cadence, reliability %, alert state.
   * Add aggregate metrics: total workflows, healthy, delayed, broken, avg detection time.

2. **Expected Behavior Modeling**

   * Replace “alert after X hours” with:

     * expected frequency
     * acceptable variance window
   * Detect silence, delays, and abnormal activity patterns.

3. **Event Timeline**

   * Persist full ping history.
   * Provide chronological activity log per monitor.
   * Highlight gaps and anomalies.

4. **Incident System**

   * Generate incidents when monitors flatline.
   * Track: start time, last event, duration, resolution state.
   * Provide incident history.

5. **Auto-Generated Monitor Endpoints**

   * Create unique ping URLs for each monitor.
   * Provide copy-paste integration instructions for automation tools.

6. **Alert Integrations**

   * Support notifications via:

     * Slack
     * Email
     * SMS
     * Discord
     * Webhooks
     * PagerDuty-style escalation.

7. **Workflow Metadata**

   * Allow tagging:

     * environment (prod/dev)
     * automation tool
     * business criticality.

8. **Teams & Workspaces**

   * Multi-user accounts.
   * Shared monitors.
   * Role permissions.

9. **Reliability Analytics**

   * Metrics:

     * automation uptime
     * average event interval
     * incident frequency
     * failure detection time.

10. **Automation Behavior Learning**

* System learns historical patterns.
* Flags abnormal silence or unusual spikes automatically.

---

**UX Improvements**

* Clear status states: **Healthy / Delayed / Broken / Waiting**.
* Incident banner for active failures.
* Visual activity graphs.
* Quick “last event” visibility.

---

**Positioning**

Rebrand messaging from:

> “Webhook silence monitor”

to:

> **Automation observability and reliability monitoring.**

Comparable conceptual space to monitoring tools like Datadog or Sentry, but focused on automation workflows.

---

**End State**

Flatline becomes the **operational layer for automation systems**, detecting when workflows silently stop doing work and alerting teams before customers notice.

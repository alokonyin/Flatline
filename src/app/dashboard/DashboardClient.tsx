"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Monitor = {
  id: string;
  name: string;
  token: string;
  threshold: number;
  last_ping: string | null;
  is_active: boolean;
  created_at: string;
};

const THRESHOLD_OPTIONS = [
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "24 hours", value: 1440 },
  { label: "48 hours", value: 2880 },
  { label: "7 days", value: 10080 },
];

type Tool = "zapier" | "make" | "n8n" | "other";

const TOOL_STEPS: Record<Tool, { label: string; note?: string; steps: string[] }> = {
  zapier: {
    label: "Zapier",
    note: "Webhooks by Zapier requires a paid Zapier plan.",
    steps: [
      "Open your Zap in the Zapier editor.",
      'Click the + button after your last action to add a new step.',
      'Search for "Webhooks by Zapier" and select it.',
      'Choose "POST" as the event.',
      "Paste your Flatline ping URL into the URL field.",
      'Leave everything else as-is and click "Continue" then "Test step".',
      "Publish your Zap. Done.",
    ],
  },
  make: {
    label: "Make (Integromat)",
    steps: [
      "Open your scenario in Make.",
      "Click the + button after your last module.",
      'Search for "HTTP" and choose the "Make a request" module.',
      "Paste your Flatline ping URL into the URL field.",
      'Set Method to "POST".',
      "Save and run your scenario to confirm the ping arrives.",
    ],
  },
  n8n: {
    label: "n8n",
    steps: [
      "Open your workflow in n8n.",
      "Add a new node at the end of your flow.",
      'Search for "HTTP Request" and add it.',
      "Set Method to POST.",
      "Paste your Flatline ping URL into the URL field.",
      "Save and execute the workflow to confirm.",
    ],
  },
  other: {
    label: "Other tool",
    steps: [
      "Find the webhook or HTTP request action in your tool.",
      "Add it as the final step of your automation.",
      "Set the method to POST (or GET — both work).",
      "Paste your Flatline ping URL as the destination.",
      "Run your automation once to confirm the ping arrives.",
    ],
  },
};

function getStatus(monitor: Monitor): "alive" | "flatlined" | "waiting" | "paused" {
  if (!monitor.is_active) return "paused";
  if (!monitor.last_ping) return "waiting";
  const diffMin = (Date.now() - new Date(monitor.last_ping).getTime()) / 60000;
  return diffMin > monitor.threshold ? "flatlined" : "alive";
}

const STATUS_CONFIG = {
  alive:     { label: "Alive",     dot: "bg-green-400",                   text: "text-green-400",      badge: "bg-green-400/10 text-green-400 border-green-400/20" },
  flatlined: { label: "Flatlined", dot: "bg-flatline-red animate-pulse",  text: "text-flatline-red",   badge: "bg-red-500/10 text-flatline-red border-red-500/20" },
  waiting:   { label: "Waiting",   dot: "bg-yellow-400",                  text: "text-yellow-400",     badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  paused:    { label: "Paused",    dot: "bg-flatline-muted",              text: "text-flatline-muted", badge: "bg-white/5 text-flatline-muted border-white/10" },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function thresholdLabel(val: number) {
  return THRESHOLD_OPTIONS.find((o) => o.value === val)?.label ?? `${val}m`;
}

function Sparkline({ status }: { status: ReturnType<typeof getStatus> }) {
  const bars = [40, 65, 50, 80, 60, 75, status === "flatlined" ? 0 : 90];
  const color = status === "flatlined" ? "#FF2D55" : status === "alive" ? "#4ade80" : "#6B6B6B";
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div key={i} className="w-1.5 rounded-sm" style={{ height: `${h}%`, backgroundColor: color, opacity: i === bars.length - 1 ? 1 : 0.4 + i * 0.08 }} />
      ))}
    </div>
  );
}

// Setup guide shown in the detail panel when a monitor hasn't pinged yet
function SetupGuide({ pingUrl, copied, onCopy }: { pingUrl: string; copied: boolean; onCopy: () => void }) {
  const [tool, setTool] = useState<Tool | null>(null);

  const tools: { id: Tool; label: string }[] = [
    { id: "zapier", label: "Zapier" },
    { id: "make", label: "Make" },
    { id: "n8n", label: "n8n" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="mt-5 border-t border-flatline-border pt-5">
      <p className="text-white text-xs font-semibold mb-1">Connect your automation</p>
      <p className="text-flatline-muted text-xs mb-4 leading-relaxed">
        Which tool are you using? We&apos;ll show you exactly what to do.
      </p>

      {/* Tool selector */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(tool === t.id ? null : t.id)}
            className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
              tool === t.id
                ? "bg-flatline-red/10 border-flatline-red text-flatline-red"
                : "border-flatline-border text-flatline-muted hover:border-white/20 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Instructions for selected tool */}
      {tool && (() => {
        const guide = TOOL_STEPS[tool];
        return (
          <div>
            {guide.note && (
              <div className="bg-yellow-400/8 border border-yellow-400/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-yellow-400 text-xs">{guide.note}</p>
              </div>
            )}

            {/* Ping URL — prominent at the top of the steps */}
            <p className="text-flatline-muted text-xs mb-1.5">Your ping URL</p>
            <div className="bg-flatline-dark border border-flatline-border rounded-lg px-3 py-2 flex items-center gap-2 mb-5">
              <code className="text-xs text-flatline-muted flex-1 truncate">{pingUrl}</code>
              <button
                onClick={onCopy}
                className="text-xs font-medium text-flatline-red hover:text-white transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <ol className="space-y-3">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-xs leading-relaxed">
                  <span className="text-flatline-red/60 font-mono shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-flatline-muted">{step}</span>
                </li>
              ))}
            </ol>

            <p className="text-flatline-muted/50 text-xs mt-4 leading-relaxed">
              Once your automation runs, this monitor will flip to <span className="text-green-400">Alive</span> automatically.
            </p>
          </div>
        );
      })()}
    </div>
  );
}

export default function DashboardClient({
  initialMonitors,
  userEmail,
}: {
  initialMonitors: Monitor[];
  userEmail: string;
}) {
  const router = useRouter();
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newThreshold, setNewThreshold] = useState(1440);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<Monitor | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const alive     = monitors.filter((m) => getStatus(m) === "alive").length;
  const flatlined = monitors.filter((m) => getStatus(m) === "flatlined").length;
  const waiting   = monitors.filter((m) => getStatus(m) === "waiting").length;

  async function createMonitor(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, threshold: newThreshold }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setMonitors([data, ...monitors]);
      setNewName("");
      setShowModal(false);
      setSelected(data); // auto-open detail panel so user sees setup guide immediately
    }
  }

  async function deleteMonitor(id: string) {
    if (!confirm("Delete this monitor?")) return;
    await fetch(`/api/monitors/${id}`, { method: "DELETE" });
    setMonitors(monitors.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function copyUrl(token: string) {
    navigator.clipboard.writeText(`${appUrl}/api/ping/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen flex bg-flatline-dark">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-flatline-border px-5 py-6 shrink-0">
        <div className="text-flatline-red font-bold text-lg mb-10">⚡ Flatline</div>
        <nav className="flex-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/>
            </svg>
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-flatline-muted hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Alerts
            {flatlined > 0 && (
              <span className="ml-auto bg-flatline-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{flatlined}</span>
            )}
          </button>
        </nav>
        <div className="border-t border-flatline-border pt-4 mt-4">
          <p className="text-flatline-muted text-xs truncate mb-3">{userEmail}</p>
          <button onClick={logout} className="text-flatline-muted hover:text-white text-xs transition-colors">Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-flatline-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-white">Dashboard</h1>
            <p className="text-flatline-muted text-xs mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-flatline-red hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> New Monitor
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: monitors.length, sub: "monitors", color: "text-white" },
              { label: "Alive", value: alive, sub: "running fine", color: "text-green-400" },
              { label: "Flatlined", value: flatlined, sub: "need attention", color: "text-flatline-red" },
              { label: "Waiting", value: waiting, sub: "no pings yet", color: "text-yellow-400" },
            ].map((s) => (
              <div key={s.label} className="bg-flatline-card border border-flatline-border rounded-xl p-5">
                <p className="text-flatline-muted text-xs mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-flatline-muted text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Monitor list */}
            <div className="flex-1 min-w-0">
              {monitors.length === 0 ? (
                <div className="bg-flatline-card border border-flatline-border rounded-xl flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-4xl mb-4">📡</div>
                  <p className="font-semibold text-white mb-1">Nothing here yet</p>
                  <p className="text-flatline-muted text-sm mb-6">Add your first monitor to start watching an automation.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-flatline-red hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                  >
                    Add Monitor
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {monitors.map((monitor) => {
                    const status = getStatus(monitor);
                    const cfg = STATUS_CONFIG[status];
                    const isSelected = selected?.id === monitor.id;
                    return (
                      <button
                        key={monitor.id}
                        onClick={() => setSelected(isSelected ? null : monitor)}
                        className={`w-full text-left bg-flatline-card border rounded-xl p-5 transition-all ${
                          isSelected ? "border-flatline-red" : "border-flatline-border hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate text-sm">{monitor.name}</p>
                              <p className="text-flatline-muted text-xs mt-0.5">
                                Last ping {timeAgo(monitor.last_ping)} · alert after {thresholdLabel(monitor.threshold)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <Sparkline status={status} />
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (() => {
              const status = getStatus(selected);
              const cfg = STATUS_CONFIG[status];
              const pingUrl = `${appUrl}/api/ping/${selected.token}`;
              const isWaiting = status === "waiting";
              return (
                <div className="w-80 shrink-0 bg-flatline-card border border-flatline-border rounded-xl p-6 self-start overflow-y-auto max-h-[calc(100vh-160px)]">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <button onClick={() => setSelected(null)} className="text-flatline-muted hover:text-white text-lg leading-none transition-colors">×</button>
                  </div>

                  <h2 className="font-bold text-white text-lg mb-1 break-words">{selected.name}</h2>
                  <p className="text-flatline-muted text-xs mb-5">Created {new Date(selected.created_at).toLocaleDateString()}</p>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-flatline-muted">Last ping</span>
                      <span className="text-white">{timeAgo(selected.last_ping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-flatline-muted">Alert after</span>
                      <span className="text-white">{thresholdLabel(selected.threshold)} silence</span>
                    </div>
                  </div>

                  {/* Show setup guide if waiting, otherwise show URL only */}
                  {isWaiting ? (
                    <SetupGuide
                      pingUrl={pingUrl}
                      copied={copied === selected.token}
                      onCopy={() => copyUrl(selected.token)}
                    />
                  ) : (
                    <>
                      <p className="text-flatline-muted text-xs mb-1.5">Ping URL</p>
                      <div className="bg-flatline-dark border border-flatline-border rounded-lg px-3 py-2 flex items-center gap-2 mb-5">
                        <code className="text-xs text-flatline-muted flex-1 truncate">{pingUrl}</code>
                        <button onClick={() => copyUrl(selected.token)} className="text-xs text-flatline-muted hover:text-white transition-colors shrink-0">
                          {copied === selected.token ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </>
                  )}

                  <div className="mt-5 pt-5 border-t border-flatline-border">
                    <button
                      onClick={() => deleteMonitor(selected.id)}
                      className="w-full border border-flatline-border hover:border-flatline-red text-flatline-muted hover:text-flatline-red text-sm py-2 rounded-lg transition-colors"
                    >
                      Delete monitor
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-flatline-card border border-flatline-border rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">New Monitor</h2>
              <button onClick={() => setShowModal(false)} className="text-flatline-muted hover:text-white text-2xl leading-none transition-colors">×</button>
            </div>
            <form onSubmit={createMonitor} className="space-y-4">
              <div>
                <label className="text-xs text-flatline-muted block mb-2">Automation name</label>
                <input
                  type="text"
                  placeholder='e.g. "New order → Google Sheets"'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-flatline-dark border border-flatline-border rounded-lg px-4 py-3 text-white placeholder-flatline-muted focus:outline-none focus:border-flatline-red text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-flatline-muted block mb-2">Alert me after this much silence</label>
                <div className="grid grid-cols-3 gap-2">
                  {THRESHOLD_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setNewThreshold(o.value)}
                      className={`py-2 rounded-lg text-sm border transition-colors ${
                        newThreshold === o.value
                          ? "bg-flatline-red border-flatline-red text-white font-semibold"
                          : "bg-flatline-dark border-flatline-border text-flatline-muted hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-flatline-red hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
              >
                {creating ? "Creating..." : "Create monitor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

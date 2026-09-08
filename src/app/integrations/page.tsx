"use client";
import { useState } from "react";
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Plug, X,
  Eye, EyeOff, ExternalLink, Clock, Database, Key, Shield,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

type ConnState = "connected" | "disconnected" | "connecting" | "error";

interface Integration {
  id:          string;
  name:        string;
  vendor:      string;
  color:       string;
  authType:    "oauth" | "apikey" | "apikey2";
  description: string;
  docsUrl:     string;
  syncEvery:   string;
  pulls:       string[];
  permissions: string[];
  // connected state extras
  connectedAs?: string;
  lastSync?:    string;
  recordsSynced?: { label: string; value: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "m365",
    name: "Microsoft 365 Copilot",
    vendor: "Microsoft",
    color: "#EA580C",
    authType: "oauth",
    description: "Pull per-user Copilot activity from Teams, Word, Excel, Outlook and PowerPoint via Microsoft Graph API.",
    docsUrl: "https://learn.microsoft.com/graph/api/reportroot-getmicrosoft365copilotusageuserdetail",
    syncEvery: "Every 6 hours",
    pulls: [
      "Per-user interactions by app (Teams, Word, Excel, Outlook)",
      "Last activity date & active days",
      "Copilot chat count, meeting summaries count",
      "Seat assignment & license status",
    ],
    permissions: ["Reports.Read.All", "User.Read.All", "Directory.Read.All"],
    connectedAs: "tenant: corp.onmicrosoft.com",
    lastSync: "3 min ago",
    recordsSynced: [
      { label: "Users synced",    value: "9" },
      { label: "Interactions",    value: "847" },
      { label: "Apps covered",    value: "4" },
      { label: "Active this month", value: "7 / 9" },
    ],
  },
  {
    id: "github",
    name: "GitHub Copilot",
    vendor: "GitHub",
    color: "#1A1D23",
    authType: "oauth",
    description: "Pull per-seat suggestion metrics, acceptance rate, language breakdown and active days via GitHub Copilot API.",
    docsUrl: "https://docs.github.com/rest/copilot/copilot-usage",
    syncEvery: "Every 6 hours",
    pulls: [
      "Suggestions shown & accepted per user",
      "Lines suggested & accepted",
      "Active days & last activity",
      "Language and editor breakdown",
    ],
    permissions: ["manage_billing:copilot", "read:org"],
    connectedAs: "org: acme-corp",
    lastSync: "3 min ago",
    recordsSynced: [
      { label: "Seats synced",     value: "5" },
      { label: "Suggestions",      value: formatNumber(3308) },
      { label: "Acceptance rate",  value: "65.4%" },
      { label: "Languages",        value: "4" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI / ChatGPT",
    vendor: "OpenAI",
    color: "#378ADD",
    authType: "apikey",
    description: "Pull daily token usage, request counts and model breakdown via the OpenAI Usage API using your org admin key.",
    docsUrl: "https://platform.openai.com/docs/api-reference/usage",
    syncEvery: "Every 12 hours",
    pulls: [
      "Prompt + completion tokens per day",
      "Request count per model",
      "Cost breakdown (GPT-4o, GPT-4o-mini, etc.)",
      "Org-level aggregation",
    ],
    permissions: ["Org Admin API key — sk-org-..."],
    connectedAs: "org: acme-ai",
    lastSync: "5 min ago",
    recordsSynced: [
      { label: "Models tracked",   value: "2" },
      { label: "Prompt tokens",    value: "82.4K" },
      { label: "Completion tokens", value: "12.6K" },
      { label: "Requests",         value: "48" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    vendor: "Anthropic",
    color: "#1D9E75",
    authType: "apikey",
    description: "Pull token usage via Anthropic API key. Per-user breakdown requires Claude for Work Admin API (currently in beta).",
    docsUrl: "https://docs.anthropic.com/en/api/getting-started",
    syncEvery: "Every 12 hours",
    pulls: [
      "Token usage per API key (input + output)",
      "Model breakdown (claude-3-5-sonnet, haiku, etc.)",
      "Request count per day",
      "Per-user data via Admin API (beta — join waitlist)",
    ],
    permissions: ["API key with usage:read scope"],
  },
  {
    id: "google",
    name: "Google Workspace / Gemini",
    vendor: "Google",
    color: "#EF9F27",
    authType: "oauth",
    description: "Pull Gemini Advanced usage per user from Google Workspace Admin SDK Reports API using a service account.",
    docsUrl: "https://developers.google.com/admin-sdk/reports/v1/guides/manage-usage-reports",
    syncEvery: "Every 6 hours",
    pulls: [
      "Gemini queries per user per day",
      "Active days in Google Workspace",
      "NotebookLM Plus usage",
      "Workspace app breakdown (Docs, Sheets, Meet)",
    ],
    permissions: [
      "admin.reports.usage.readonly",
      "Service account with domain-wide delegation",
    ],
  },
  {
    id: "aws",
    name: "AWS Bedrock",
    vendor: "AWS",
    color: "#D4537E",
    authType: "apikey2",
    description: "Pull model invocation metrics, token counts and costs from AWS CloudWatch via your AWS Access Key and Secret.",
    docsUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring.html",
    syncEvery: "Every 12 hours",
    pulls: [
      "Invocation count per model",
      "Input + output token counts",
      "Cost per model via CostExplorer API",
      "Error rate & latency metrics",
    ],
    permissions: ["cloudwatch:GetMetricData", "ce:GetCostAndUsage"],
  },
];

const defaultStates: Record<string, ConnState> = {
  m365: "connected", github: "connected", openai: "connected",
  anthropic: "disconnected", google: "disconnected", aws: "disconnected",
};

function StatusBadge({ state }: { state: ConnState }) {
  const meta = {
    connected:    { label: "Connected",    bg: "#DCFCE7", text: "#16A34A", icon: CheckCircle },
    disconnected: { label: "Not connected", bg: "#F3F4F6", text: "#6B7280", icon: XCircle },
    connecting:   { label: "Connecting…",  bg: "#FFF7ED", text: "#EA580C", icon: RefreshCw },
    error:        { label: "Error",        bg: "#FEF2F2", text: "#DC2626", icon: AlertTriangle },
  }[state];
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
      style={{ background: meta.bg, color: meta.text }}>
      <meta.icon size={10} className={state === "connecting" ? "animate-spin" : ""} />
      {meta.label}
    </span>
  );
}

export default function IntegrationsPage() {
  const [states, setStates]     = useState<Record<string, ConnState>>(defaultStates);
  const [modal, setModal]       = useState<Integration | null>(null);
  const [apiKey, setApiKey]     = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const connectedCount = Object.values(states).filter((s) => s === "connected").length;

  function openConnect(intg: Integration) {
    setApiKey(""); setApiSecret(""); setShowKey(false);
    setModal(intg);
  }

  function handleOAuth(id: string) {
    setModal(null);
    setStates((prev) => ({ ...prev, [id]: "connecting" }));
    setTimeout(() => setStates((prev) => ({ ...prev, [id]: "connected" })), 2200);
  }

  function handleApiKey(id: string) {
    if (!apiKey.trim()) return;
    setModal(null);
    setStates((prev) => ({ ...prev, [id]: "connecting" }));
    setTimeout(() => setStates((prev) => ({ ...prev, [id]: "connected" })), 1800);
  }

  function handleDisconnect(id: string) {
    setStates((prev) => ({ ...prev, [id]: "disconnected" }));
  }

  function handleSync(id: string) {
    setSyncingId(id);
    setTimeout(() => setSyncingId(null), 2000);
  }

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Integrations</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Connect AI tool providers to pull live usage data into AIMeter
        </p>
      </div>

      {/* Summary strip */}
      <div className="rounded-lg border px-4 py-3 mb-6 flex flex-wrap items-center gap-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent)" + "18" }}>
            <Plug size={15} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {connectedCount} of {INTEGRATIONS.length} connected
            </div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>
              Live data syncing for {connectedCount} provider{connectedCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="h-8 border-l hidden sm:block" style={{ borderColor: "var(--border)" }} />
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Seats tracked",   value: "16" },
            { label: "Data points/day", value: "840+" },
            { label: "Sync frequency",  value: "6h / 12h" },
            { label: "Encryption",      value: "AES-256" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>{s.label}</div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
          <Shield size={11} />
          Credentials encrypted at rest
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((intg) => {
          const state     = states[intg.id];
          const connected = state === "connected";
          const syncing   = syncingId === intg.id;

          return (
            <div key={intg.id} className="rounded-lg border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: connected ? intg.color + "40" : "var(--border)" }}>

              {/* Card header */}
              <div className="px-5 py-4 border-b flex items-start justify-between gap-3"
                style={{ borderColor: "var(--border)", background: connected ? intg.color + "06" : "var(--bg)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ background: intg.color }}>
                    {intg.vendor[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{intg.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{intg.vendor}</div>
                  </div>
                </div>
                <StatusBadge state={state} />
              </div>

              {/* Card body */}
              <div className="px-5 py-4">
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
                  {intg.description}
                </p>

                {/* What it pulls */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Database size={11} style={{ color: "var(--accent)" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                      Data pulled
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {intg.pulls.map((p) => (
                      <div key={p} className="flex items-start gap-1.5 text-[11px]" style={{ color: "var(--text)" }}>
                        <span className="mt-0.5 flex-shrink-0" style={{ color: intg.color }}>+</span>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected: live metrics */}
                {connected && intg.recordsSynced && (
                  <div className="rounded-lg p-3 mb-4 grid grid-cols-2 gap-2"
                    style={{ background: intg.color + "0A", border: `1px solid ${intg.color}25` }}>
                    <div className="col-span-2 flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#16A34A" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "#16A34A" }}>
                        Live · Last synced {intg.lastSync}
                      </span>
                      <span className="text-[10px] ml-auto" style={{ color: "var(--muted)" }}>
                        via {intg.connectedAs}
                      </span>
                    </div>
                    {intg.recordsSynced.map((r) => (
                      <div key={r.label}>
                        <div className="text-[10px]" style={{ color: "var(--muted)" }}>{r.label}</div>
                        <div className="text-sm font-bold" style={{ color: "var(--text)" }}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Auth required (disconnected) */}
                {!connected && (
                  <div className="rounded-lg p-3 mb-4"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Key size={10} style={{ color: "var(--muted)" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                        {intg.authType === "oauth" ? "OAuth — admin consent required" : "API Key required"}
                      </span>
                    </div>
                    {intg.permissions.map((p) => (
                      <div key={p} className="text-[11px] font-mono" style={{ color: "var(--text)" }}>
                        · {p}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: sync info + actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                    <Clock size={10} />
                    {connected ? intg.syncEvery : "Not syncing"}
                    <a href={intg.docsUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-0.5 ml-2 hover:underline"
                      style={{ color: intg.color }}>
                      Docs <ExternalLink size={9} />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {connected ? (
                      <>
                        <button
                          onClick={() => handleSync(intg.id)}
                          disabled={syncing}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border font-medium"
                          style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--bg)" }}>
                          <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                          {syncing ? "Syncing…" : "Sync now"}
                        </button>
                        <button
                          onClick={() => handleDisconnect(intg.id)}
                          className="px-2.5 py-1.5 rounded-md text-xs border font-medium"
                          style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "#FEF2F2" }}>
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openConnect(intg)}
                        disabled={state === "connecting"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white"
                        style={{ background: state === "connecting" ? "var(--muted)" : intg.color }}>
                        <Plug size={11} />
                        {state === "connecting" ? "Connecting…" : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            style={{ background: "var(--surface)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--border)", background: modal.color + "08" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: modal.color }}>
                  {modal.vendor[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Connect {modal.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                    {modal.authType === "oauth" ? "OAuth 2.0 — admin consent" : "API key authentication"}
                  </div>
                </div>
              </div>
              <button onClick={() => setModal(null)}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: "var(--bg)", color: "var(--muted)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">

              {/* Permissions list */}
              <div className="rounded-lg p-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>
                  {modal.authType === "oauth" ? "Permissions requested" : "Required credentials"}
                </div>
                {modal.permissions.map((p) => (
                  <div key={p} className="flex items-center gap-1.5 text-[11px] font-mono mb-1" style={{ color: "var(--text)" }}>
                    <span style={{ color: modal.color }}>·</span> {p}
                  </div>
                ))}
              </div>

              {/* OAuth flow */}
              {modal.authType === "oauth" && (
                <>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    You will be redirected to <strong style={{ color: "var(--text)" }}>{modal.vendor}</strong> to
                    authorize AIMeter. An IT admin or org owner must approve the permissions above.
                    AIMeter only reads usage reports — it cannot modify any data.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                      Cancel
                    </button>
                    <button onClick={() => handleOAuth(modal.id)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{ background: modal.color }}>
                      <ExternalLink size={13} />
                      Authorize with {modal.vendor}
                    </button>
                  </div>
                </>
              )}

              {/* API Key flow (single key) */}
              {modal.authType === "apikey" && (
                <>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text)" }}>
                      API Key <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                      style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={modal.id === "openai" ? "sk-org-..." : "sk-ant-..."}
                        className="flex-1 bg-transparent outline-none text-xs font-mono"
                        style={{ color: "var(--text)" }}
                      />
                      <button onClick={() => setShowKey((v) => !v)}
                        style={{ color: "var(--muted)" }}>
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: "var(--muted)" }}>
                      Stored encrypted with AES-256. Never logged or exposed in responses.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                      Cancel
                    </button>
                    <button onClick={() => handleApiKey(modal.id)}
                      disabled={!apiKey.trim()}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: apiKey.trim() ? modal.color : "var(--muted)" }}>
                      Verify &amp; Connect
                    </button>
                  </div>
                </>
              )}

              {/* AWS: two keys */}
              {modal.authType === "apikey2" && (
                <>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text)" }}>
                        AWS Access Key ID <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none"
                        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text)" }}>
                        AWS Secret Access Key <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                        style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                        <input
                          type={showKey ? "text" : "password"}
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="wJalrXUtnFEMI/K7MDENG/..."
                          className="flex-1 bg-transparent outline-none text-xs font-mono"
                          style={{ color: "var(--text)" }}
                        />
                        <button onClick={() => setShowKey((v) => !v)} style={{ color: "var(--muted)" }}>
                          {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                    We recommend creating a read-only IAM user with only <code>cloudwatch:GetMetricData</code> and <code>ce:GetCostAndUsage</code> permissions.
                    Credentials stored encrypted with AES-256.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                      Cancel
                    </button>
                    <button onClick={() => handleApiKey(modal.id)}
                      disabled={!apiKey.trim() || !apiSecret.trim()}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: (apiKey.trim() && apiSecret.trim()) ? modal.color : "var(--muted)" }}>
                      Verify &amp; Connect
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

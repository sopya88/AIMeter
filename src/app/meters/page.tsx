"use client";
import { useState } from "react";
import { Activity, Plus, Search } from "lucide-react";
import { meters, ingestEvents, type MeterStatus } from "@/data/mock";

const STATUS_TABS: { label: string; value: MeterStatus | "all" }[] = [
  { label: "All",        value: "all" },
  { label: "Active",     value: "active" },
  { label: "Draft",      value: "draft" },
  { label: "Deprecated", value: "deprecated" },
];

const NAV_TABS = ["Meters", "Ingest events", "Schemas"] as const;
type NavTab = typeof NAV_TABS[number];

const statusBadge: Record<MeterStatus, { bg: string; text: string; label: string }> = {
  active:     { bg: "#DCFCE7", text: "#16A34A", label: "Active" },
  draft:      { bg: "#F3F4F6", text: "#6B7280", label: "Draft" },
  deprecated: { bg: "#FEF2F2", text: "#DC2626", label: "Deprecated" },
};

const meterTypeLabel: Record<string, string> = {
  COUNT_SUM:    "Count Sum",
  UNIQUE_COUNT: "Unique Count",
  MAX:          "Max",
};

export default function MetersPage() {
  const [navTab, setNavTab]     = useState<NavTab>("Meters");
  const [statusFilter, setStatusFilter] = useState<MeterStatus | "all">("all");
  const [search, setSearch]     = useState("");

  const filtered = meters.filter((m) => {
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) ||
                        m.apiName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Meters</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Define what gets measured from raw ingest events</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Plus size={14} /><span className="hidden sm:inline">Create meter</span><span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Top nav tabs */}
      <div className="flex gap-0 border-b mb-5" style={{ borderColor: "var(--border)" }}>
        {NAV_TABS.map((t) => (
          <button key={t} onClick={() => setNavTab(t)}
            className="px-4 py-2.5 text-sm font-medium -mb-px transition-colors"
            style={navTab === t
              ? { color: "var(--accent)", borderBottom: "2px solid var(--accent)" }
              : { color: "var(--muted)" }}>
            {t}
          </button>
        ))}
      </div>

      {navTab === "Meters" && (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1 border rounded-md px-3 py-1.5 flex-1 min-w-[180px] max-w-xs"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <Search size={13} style={{ color: "var(--muted)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meters…"
                className="ml-1 text-sm outline-none w-full bg-transparent"
                style={{ color: "var(--text)" }} />
            </div>
            <div className="flex gap-1">
              {STATUS_TABS.map(({ label, value }) => (
                <button key={value} onClick={() => setStatusFilter(value)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                  style={statusFilter === value
                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                    : { background: "var(--surface)", color: "var(--muted)", borderColor: "var(--border)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                    {["Label", "API Name", "Meter Type", "Status", "Modified"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium"
                        style={{ color: "var(--muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const badge = statusBadge[m.status];
                    return (
                      <tr key={m.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <Activity size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                            <span className="font-medium" style={{ color: "var(--text)" }}>{m.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{m.apiName}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{meterTypeLabel[m.meterType]}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: badge.bg, color: badge.text }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{m.modified}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>No meters found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {navTab === "Ingest events" && (
        <div className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  {["Event ID", "Customer ID", "Provider", "Model", "Fine-tuned", "Prompt", "Completion", "Total", "Timestamp"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium whitespace-nowrap"
                      style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingestEvents.map((e, i) => (
                  <tr key={e.id}
                    style={{ borderBottom: i < ingestEvents.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{e.id}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text)" }}>{e.customerId}</td>
                    <td className="px-4 py-3 text-xs capitalize" style={{ color: "var(--text)" }}>{e.provider}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text)" }}>{e.model}</td>
                    <td className="px-4 py-3 text-xs"
                      style={{ color: e.fine_tuned ? "#16A34A" : "var(--muted)" }}>
                      {e.fine_tuned ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{e.usage.prompt_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{e.usage.completion_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>{e.usage.total_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(e.created * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {navTab === "Schemas" && (
        <div className="rounded-lg border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>AUTO schema (active)</div>
          <pre className="text-xs rounded-md p-4 overflow-x-auto"
            style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}>
{`{
  "customerId": "string",       // required
  "model":      "string",       // required
  "provider":   "string",       // required
  "fine_tuned": "boolean",
  "created":    "unix_timestamp",
  "usage": {
    "prompt_tokens":     "integer",
    "completion_tokens": "integer",
    "total_tokens":      "integer"
  }
}`}
          </pre>
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            The AUTO schema maps <code className="font-mono">usage.prompt_tokens</code> → <strong>input_tokens</strong> meter and{" "}
            <code className="font-mono">usage.completion_tokens</code> → <strong>output_tokens</strong> meter automatically.
          </p>
        </div>
      )}
    </div>
  );
}

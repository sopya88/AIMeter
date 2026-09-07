"use client";
import { useState } from "react";
import { Bot, Cpu, DollarSign, AlertTriangle, Play, Pause, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { agents, departments, type AgentStatus } from "@/data/mock";
import { formatINR, formatTokens, formatNumber } from "@/lib/utils";

const statusMeta: Record<AgentStatus, { label: string; bg: string; text: string; dot: string }> = {
  running:   { label: "Running",   bg: "#DCFCE7", text: "#16A34A", dot: "#16A34A" },
  paused:    { label: "Paused",    bg: "#F3F4F6", text: "#6B7280", dot: "#6B7280" },
  error:     { label: "Error",     bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626" },
  scheduled: { label: "Scheduled", bg: "#EFF6FF", text: "#185FA5", dot: "#185FA5" },
};

const providerColors: Record<string, string> = {
  OpenAI: "#378ADD", Anthropic: "#1D9E75", Google: "#EF9F27",
};

const PIE_COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#D4537E", "#6B7280", "#A78BFA", "#F97316", "#06B6D4"];

export default function AgentsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState<AgentStatus | "all">("all");

  const filtered = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
      || a.owner.toLowerCase().includes(search.toLowerCase())
      || a.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const detail = selected ? agents.find((a) => a.id === selected) : null;

  const totalCostINR  = agents.reduce((s, a) => s + a.costINR, 0);
  const totalApiCalls = agents.reduce((s, a) => s + a.apiCallsMonth, 0);
  const totalTokens   = agents.reduce((s, a) => s + a.tokensUsed, 0);
  const runningCount  = agents.filter((a) => a.status === "running").length;

  // Department cost aggregation for bar chart
  const deptCosts = departments.map((d) => ({
    name: d.name.split(" ")[0],
    costINR: agents.filter((a) => a.department === d.name).reduce((s, a) => s + a.costINR, 0),
  })).filter((d) => d.costINR > 0);

  // Provider cost aggregation for pie chart
  const providerCosts = Object.entries(
    agents.reduce<Record<string, number>>((acc, a) => {
      acc[a.provider] = (acc[a.provider] ?? 0) + a.costINR;
      return acc;
    }, {})
  ).map(([name, costINR]) => ({ name, costINR }));

  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>AI Agent Registry</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Agent-wise API cost · Department attribution · INR billing
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Agent Cost (Jun)", value: formatINR(totalCostINR),   color: "#185FA5", icon: DollarSign },
          { label: "Running Agents",         value: String(runningCount),       color: "#1D9E75", icon: Play },
          { label: "Total API Calls",        value: formatNumber(totalApiCalls),color: "#EF9F27", icon: Cpu },
          { label: "Tokens Consumed",        value: formatTokens(totalTokens),  color: "#D4537E", icon: Bot },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border p-3 md:p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs leading-tight" style={{ color: "var(--muted)" }}>{m.label}</div>
              <div className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center"
                style={{ background: m.color + "18" }}>
                <m.icon size={13} style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-xl font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Cost by Department (₹)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptCosts} barSize={28} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={false} tickLine={false} width={70} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatINR(Number(val))}
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Bar dataKey="costINR" name="Cost (INR)" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Cost by Provider</div>
          <div className="flex items-center gap-4 flex-wrap">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={providerCosts} dataKey="costINR" innerRadius={38} outerRadius={62} paddingAngle={3}>
                  {providerCosts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {providerCosts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{p.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted)" }}>{formatINR(p.costINR)}/mo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px] px-3 py-2 rounded-md border text-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Search size={13} style={{ color: "var(--muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agent, owner, department…"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: "var(--text)" }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "running", "paused", "error", "scheduled"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border capitalize"
              style={statusFilter === s
                ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Agent table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Agent", "Owner", "Department", "Model / Provider", "API Calls", "Tokens", "Monthly Cost (INR)", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const sm = statusMeta[a.status];
                const pColor = providerColors[a.provider] ?? "#6B7280";
                return (
                  <tr key={a.id}
                    onClick={() => setSelected(selected === a.id ? null : a.id)}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--accent-light)" }}>
                          <Bot size={12} style={{ color: "var(--accent)" }} />
                        </div>
                        <div>
                          <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{a.name}</div>
                          <div className="text-[10px]" style={{ color: "var(--muted)" }}>{a.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{a.owner}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{a.department}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{a.model}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: pColor }} />
                        <span className="text-[10px]" style={{ color: "var(--muted)" }}>{a.provider}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{formatNumber(a.apiCallsMonth)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{formatTokens(a.tokensUsed)}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>
                      {formatINR(a.costINR)}
                      <div className="text-[10px] font-normal" style={{ color: "var(--muted)" }}>
                        +{formatINR(a.costINR * 0.18)} IGST
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full w-fit font-medium"
                        style={{ background: sm.bg, color: sm.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sm.dot }} />
                        {sm.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                <td colSpan={4} className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>
                  Total ({filtered.length} agents)
                </td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>
                  {formatNumber(filtered.reduce((s, a) => s + a.apiCallsMonth, 0))}
                </td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>
                  {formatTokens(filtered.reduce((s, a) => s + a.tokensUsed, 0))}
                </td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--accent)" }}>
                  {formatINR(filtered.reduce((s, a) => s + a.costINR, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Detail drawer (below table) */}
      {detail && (
        <div className="mt-4 rounded-lg border p-4 md:p-5"
          style={{ background: "var(--surface)", borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" }}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-semibold text-base" style={{ color: "var(--text)" }}>{detail.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{detail.description}</div>
            </div>
            <button onClick={() => setSelected(null)}
              className="text-xs px-2 py-1 rounded border"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Owner",         value: detail.owner },
              { label: "Department",    value: detail.department },
              { label: "Model",         value: detail.model },
              { label: "Provider",      value: detail.provider },
              { label: "Created",       value: detail.createdDate },
              { label: "Last Run",      value: detail.lastRun },
              { label: "Monthly Cost",  value: formatINR(detail.costINR) },
              { label: "IGST (18%)",    value: formatINR(detail.costINR * 0.18) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[11px] mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

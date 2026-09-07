"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Cpu, DollarSign, PhoneCall, Users, Shield, AlertTriangle } from "lucide-react";
import {
  dailyUsage, providerColors, providerBreakdown, summaryMetrics,
  departments, licenses,
} from "@/data/mock";
import { formatUSD, formatTokens, formatNumber, formatINR } from "@/lib/utils";

type GroupBy = "openai" | "anthropic" | "google" | "cohere";
const GROUP_OPTS: { value: GroupBy; label: string }[] = [
  { value: "openai",    label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google",    label: "Google" },
  { value: "cohere",    label: "Cohere" },
];

const metrics = [
  { label: "Total Input Tokens",  value: formatTokens(summaryMetrics.totalInputTokens),  icon: Cpu,       color: "#185FA5" },
  { label: "Total Output Tokens", value: formatTokens(summaryMetrics.totalOutputTokens), icon: Cpu,       color: "#1D9E75" },
  { label: "Total Cost",          value: formatUSD(summaryMetrics.totalCost),             icon: DollarSign,color: "#EF9F27" },
  { label: "API Requests",        value: formatNumber(summaryMetrics.totalRequests),      icon: PhoneCall, color: "#D4537E" },
  { label: "Active Customers",    value: String(summaryMetrics.activeCustomers),          icon: Users,     color: "#6B7280" },
];

export default function Dashboard() {
  const [activeProviders, setActiveProviders] = useState<Set<GroupBy>>(
    new Set(["openai", "anthropic", "google", "cohere"])
  );

  const toggle = (p: GroupBy) =>
    setActiveProviders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) { if (next.size > 1) next.delete(p); }
      else next.add(p);
      return next;
    });

  // thin data for mobile
  const chartData = dailyUsage.filter((_, i) => i % 2 === 0);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Dashboard</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>June 2024 — token usage & cost overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border p-3 md:p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] leading-tight" style={{ color: "var(--muted)" }}>{m.label}</div>
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: m.color + "18" }}>
                <m.icon size={13} style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-xl font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Usage line chart */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Token Usage Over Time</div>
          {/* Provider toggles */}
          <div className="flex flex-wrap gap-2">
            {GROUP_OPTS.map(({ value, label }) => {
              const on = activeProviders.has(value);
              return (
                <button key={value} onClick={() => toggle(value)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={on
                    ? { background: providerColors[value] + "18", borderColor: providerColors[value], color: providerColors[value] }
                    : { background: "var(--bg)", borderColor: "var(--border)", color: "var(--muted)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: on ? providerColors[value] : "var(--border)" }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tickFormatter={(v) => formatTokens(v)} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={42} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => formatTokens(Number(val))}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }}
            />
            {GROUP_OPTS.filter(({ value }) => activeProviders.has(value)).map(({ value, label }) => (
              <Line key={value} type="monotone" dataKey={value} name={label}
                stroke={providerColors[value]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Governance quick-view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Department spend */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Dept. AI Spend (₹)</div>
            <a href="/audit" className="text-xs" style={{ color: "var(--accent)" }}>View audit →</a>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={departments.map((d) => ({ name: d.name.split(" ")[0], spent: d.spentINR, budget: d.budgetINR }))} barSize={14} barGap={2}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 8, fill: "#6B7280" }} axisLine={false} tickLine={false} width={38} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatINR(Number(val))}
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Bar dataKey="budget" name="Budget"  fill="var(--border)"  radius={[3, 3, 0, 0]} />
              <Bar dataKey="spent"  name="Spent"   fill="var(--accent)"  radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* License alerts */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>License Governance</div>
            <a href="/licenses" className="text-xs" style={{ color: "var(--accent)" }}>Manage →</a>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: "Total Licenses",  value: String(licenses.length),                                            color: "#185FA5", icon: Shield },
              { label: "Unused",          value: String(licenses.filter((l) => l.status === "unused").length),       color: "#D97706", icon: AlertTriangle },
              { label: "Monthly Spend",   value: formatINR(licenses.reduce((s, l) => s + l.monthlySpendINR, 0)),     color: "#1D9E75", icon: Users },
              { label: "Wasted/month",    value: formatINR(licenses.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0)), color: "#DC2626", icon: AlertTriangle },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border p-2.5"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon size={11} style={{ color: m.color }} />
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>{m.label}</span>
                </div>
                <div className="text-base font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] px-2 py-1.5 rounded"
            style={{ background: "#FEF3C7", color: "#D97706" }}>
            ⚠ {licenses.filter((l) => l.status === "unused").length} unused licenses costing{" "}
            {formatINR(licenses.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0))}/month.{" "}
            <a href="/licenses" className="font-semibold underline">Review now</a>
          </div>
        </div>
      </div>

      {/* Provider breakdown table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b text-sm font-medium"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}>
          Provider Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Provider", "Input Tokens", "Output Tokens", "Requests", "Cost"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium"
                    style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providerBreakdown.map((row, i) => {
                const key = row.provider.toLowerCase() as GroupBy;
                const color = providerColors[key] ?? "#6B7280";
                return (
                  <tr key={row.provider}
                    style={{ borderBottom: i < providerBreakdown.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="font-medium text-xs" style={{ color: "var(--text)" }}>{row.provider}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{formatTokens(row.inputTokens)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text)" }}>{formatTokens(row.outputTokens)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{formatNumber(row.requests)}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>{formatUSD(row.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

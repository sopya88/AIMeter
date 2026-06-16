"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { IndianRupee, Cpu, PhoneCall, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { monthlySpend, providerBreakdown, topTeams, activeAlerts, PROVIDER_COLORS } from "@/data/mock";
import { formatINR, formatNumber } from "@/lib/utils";

const metrics = [
  { label: "Total Spend (Jun)", value: "₹3,27,310", sub: "+18% vs May", icon: IndianRupee, color: "#185FA5" },
  { label: "Tokens Consumed", value: "1.01B", sub: "This month", icon: Cpu, color: "#1D9E75" },
  { label: "API Calls", value: "2,54,500", sub: "This month", icon: PhoneCall, color: "#EF9F27" },
  { label: "Active Teams", value: "5", sub: "Across 4 providers", icon: Users, color: "#D4537E" },
];

const severityStyle: Record<string, { bg: string; text: string }> = {
  critical: { bg: "#FEF2F2", text: "#DC2626" },
  warning: { bg: "#FFFBEB", text: "#D97706" },
};

export default function Dashboard() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>June 2024 — All providers</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg p-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</div>
                <div className="text-2xl font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
                <div className="text-xs mt-1 flex items-center gap-1" style={{ color: m.color }}>
                  <TrendingUp size={11} />
                  {m.sub}
                </div>
              </div>
              <div className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ background: m.color + "18" }}>
                <m.icon size={18} style={{ color: m.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Stacked Bar Chart */}
        <div className="col-span-2 rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Monthly Spend by Provider</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySpend} barSize={28}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => formatINR(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.entries(PROVIDER_COLORS).map(([name, color], i, arr) => (
                <Bar key={name} dataKey={name} stackId="a" fill={color}
                  radius={i === arr.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Breakdown */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Provider Breakdown</div>
          <div className="flex flex-col gap-4">
            {providerBreakdown.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{p.name}</span>
                  <span style={{ color: "var(--muted)" }}>{formatINR(p.spend)}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full"
                    style={{ width: `${p.pct}%`, background: PROVIDER_COLORS[p.name as keyof typeof PROVIDER_COLORS] }} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {formatNumber(Math.round(p.tokens / 1e6))}M tokens · {formatNumber(p.calls)} calls
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Teams */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Top Teams by Spend</div>
          <div className="flex flex-col gap-3">
            {topTeams.map((t) => {
              const pct = Math.round((t.spend / t.budget) * 100);
              return (
                <div key={t.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: "var(--text)" }}>{t.name}</span>
                    <span style={{ color: pct >= 75 ? "#DC2626" : "var(--muted)" }}>
                      {formatINR(t.spend)}
                      <span style={{ color: "var(--muted)" }}> / {formatINR(t.budget)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-1.5 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? "#DC2626" : pct >= 70 ? "#D97706" : "var(--accent)" }} />
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t.lead} · {pct}% used</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Active Alerts</div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              {activeAlerts.length} active
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {activeAlerts.map((a) => {
              const s = severityStyle[a.severity];
              return (
                <div key={a.id} className="flex items-start gap-2.5 rounded-md p-3" style={{ background: s.bg }}>
                  <AlertTriangle size={14} style={{ color: s.text, marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: s.text }}>{a.team}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text)" }}>{a.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

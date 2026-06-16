"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { dailyTokens, modelRequests, latencyData, PROVIDER_COLORS } from "@/data/mock";
import { formatNumber } from "@/lib/utils";

export default function Usage() {
  const displayTokens = dailyTokens.filter((_, i) => i % 3 === 0); // thin the data for display

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Usage</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Token consumption, model distribution & latency — June 2024</p>
      </div>

      {/* Daily Token Line Chart */}
      <div className="rounded-lg border p-5 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Daily Token Consumption by Provider</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={displayTokens}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => `${formatNumber(Number(val))} tokens`}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(PROVIDER_COLORS).map(([name, color]) => (
              <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Doughnut — Requests by Model */}
        <div className="rounded-lg border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Requests by Model</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={modelRequests} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {modelRequests.map((m) => <Cell key={m.name} fill={m.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {modelRequests.map((m) => (
                <div key={m.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: m.color }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{m.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{formatNumber(m.value)} calls</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latency Table */}
        <div className="rounded-lg border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Latency — P50 / P95 / P99 (ms)</div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Model", "P50", "P95", "P99"].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latencyData.map((row, i) => (
                <tr key={row.model}
                  style={{ borderBottom: i < latencyData.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="py-2.5 text-xs font-medium" style={{ color: "var(--text)" }}>{row.model}</td>
                  <td className="py-2.5 text-xs" style={{ color: "var(--text)" }}>{row.p50}</td>
                  <td className="py-2.5 text-xs" style={{ color: row.p95 > 2000 ? "#D97706" : "var(--text)" }}>{row.p95}</td>
                  <td className="py-2.5 text-xs" style={{ color: row.p99 > 3500 ? "#DC2626" : "var(--text)" }}>{row.p99}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

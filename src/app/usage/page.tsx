"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { dailyTokens, modelRequests, latencyData, PROVIDER_COLORS } from "@/data/mock";
import { formatNumber } from "@/lib/utils";

export default function Usage() {
  const displayTokens = dailyTokens.filter((_, i) => i % 3 === 0);

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Usage</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Token consumption, model distribution & latency — June 2024</p>
      </div>

      {/* Line Chart */}
      <div className="rounded-lg border p-4 md:p-5 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Daily Token Consumption by Provider</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={displayTokens}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={38} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => `${formatNumber(Number(val))} tokens`}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {Object.entries(PROVIDER_COLORS).map(([name, color]) => (
              <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Doughnut + Latency — stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 md:p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Requests by Model</div>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={modelRequests} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2}>
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

        <div className="rounded-lg border p-4 md:p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Latency — P50 / P95 / P99 (ms)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[280px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Model", "P50", "P95", "P99"].map((h) => (
                    <th key={h} className="text-left pb-2 text-xs font-medium whitespace-nowrap"
                      style={{ color: "var(--muted)" }}>{h}</th>
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
    </div>
  );
}

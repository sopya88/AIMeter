"use client";
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { dailyUsage, providerColors, providerBreakdown, customers, ingestEvents } from "@/data/mock";
import { formatTokens, formatNumber } from "@/lib/utils";

type GroupByKey = "provider" | "customer" | "model";

const GROUP_OPTIONS: { value: GroupByKey; label: string }[] = [
  { value: "provider", label: "Provider" },
  { value: "customer", label: "Customer" },
  { value: "model",    label: "Model" },
];

// model-level aggregation from ingest events
const modelAgg = ingestEvents.reduce<Record<string, { input: number; output: number; requests: number }>>((acc, e) => {
  if (!acc[e.model]) acc[e.model] = { input: 0, output: 0, requests: 0 };
  acc[e.model].input    += e.usage.prompt_tokens;
  acc[e.model].output   += e.usage.completion_tokens;
  acc[e.model].requests += 1;
  return acc;
}, {});
const modelRows = Object.entries(modelAgg).map(([model, v]) => ({ model, ...v }));

const modelColors = ["#378ADD","#1D9E75","#EF9F27","#D4537E","#6B7280","#A78BFA"];

// customer-level chart data
const customerChartData = customers.map((c) => ({
  name: c.name.split(" ")[0],
  input:  c.inputTokens,
  output: c.outputTokens,
}));

export default function UsagePage() {
  const [groupBy, setGroupBy] = useState<GroupByKey>("provider");
  const chartData = dailyUsage.filter((_, i) => i % 2 === 0);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Usage</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Token consumption across providers, customers & models</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Input Tokens",  value: formatTokens(providerBreakdown.reduce((s, p) => s + p.inputTokens, 0)) },
          { label: "Total Output Tokens", value: formatTokens(providerBreakdown.reduce((s, p) => s + p.outputTokens, 0)) },
          { label: "Total Requests",      value: formatNumber(providerBreakdown.reduce((s, p) => s + p.requests, 0)) },
          { label: "Active Customers",    value: String(customers.filter((c) => c.status === "active").length) },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border p-3 md:p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-xl font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Line chart with group-by */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Token Usage Over Time</div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--muted)" }}>Group by:</span>
            <div className="flex gap-1">
              {GROUP_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setGroupBy(value)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
                  style={groupBy === value
                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                    : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {groupBy === "provider" && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tickFormatter={(v) => formatTokens(v)} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatTokens(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.entries(providerColors).map(([key, color]) => (
                <Line key={key} type="monotone" dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)}
                  stroke={color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {groupBy === "customer" && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={customerChartData} barSize={20}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatTokens(v)} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatTokens(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="input"  name="Input Tokens"  fill="#378ADD" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="output" name="Output Tokens" fill="#1D9E75" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {groupBy === "model" && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modelRows} barSize={24} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => formatTokens(v)} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="model" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatTokens(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Bar dataKey="input"  name="Input"  fill="#378ADD" stackId="a" />
              <Bar dataKey="output" name="Output" fill="#1D9E75" stackId="a" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider breakdown table */}
        <div className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-4 py-3 border-b text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}>Provider Breakdown</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[340px]">
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  {["Provider", "Input", "Output", "Requests"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providerBreakdown.map((row, i) => {
                  const color = providerColors[row.provider.toLowerCase() as keyof typeof providerColors] ?? "#6B7280";
                  return (
                    <tr key={row.provider}
                      style={{ borderBottom: i < providerBreakdown.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{row.provider}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text)" }}>{formatTokens(row.inputTokens)}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text)" }}>{formatTokens(row.outputTokens)}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: "var(--muted)" }}>{formatNumber(row.requests)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model doughnut */}
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Requests by Model</div>
          <div className="flex items-center gap-4 flex-wrap">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={modelRows} dataKey="requests" innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {modelRows.map((_, i) => <Cell key={i} fill={modelColors[i % modelColors.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {modelRows.map((m, i) => (
                <div key={m.model} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: modelColors[i % modelColors.length] }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{m.model}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted)" }}>{m.requests} req · {formatTokens(m.input + m.output)} tokens</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

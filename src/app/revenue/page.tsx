"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";
import { TrendingUp, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { customers, pricingPlans } from "@/data/mock";
import { formatUSD, formatNumber } from "@/lib/utils";

// Monthly revenue mock (MRR trend)
const mrrTrend = [
  { month: "Jan", mrr: 2840 },
  { month: "Feb", mrr: 3210 },
  { month: "Mar", mrr: 3680 },
  { month: "Apr", mrr: 4020 },
  { month: "May", mrr: 4580 },
  { month: "Jun", mrr: 5105 },
];

// Revenue by plan
const revenueByPlan = [
  { plan: "Starter", customers: 2, mrr: 1180, color: "#378ADD" },
  { plan: "Growth",  customers: 2, mrr: 2181, color: "#1D9E75" },
  { plan: "Scale",   customers: 1, mrr: 1205, color: "#EF9F27" },
];

// Per-customer revenue (from mock)
const customerRevenue = customers
  .sort((a, b) => b.totalCost - a.totalCost)
  .map((c) => ({
    name:       c.name,
    externalId: c.externalId,
    plan:       c.plan,
    mrr:        c.totalCost,
    status:     c.status,
  }));

const totalMRR   = customers.reduce((s, c) => s + c.totalCost, 0);
const activeCust = customers.filter((c) => c.status === "active").length;
const arpu       = totalMRR / activeCust;
const growth     = ((mrrTrend[5].mrr - mrrTrend[4].mrr) / mrrTrend[4].mrr) * 100;

const statusStyle = {
  active:   { bg: "#DCFCE7", text: "#16A34A" },
  inactive: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function RevenuePage() {
  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Revenue</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>MRR, ARPU and per-customer billing — June 2024</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "MRR (Jun)",        value: formatUSD(totalMRR),       icon: DollarSign, color: "#185FA5", sub: `+${growth.toFixed(1)}% MoM` },
          { label: "Active customers", value: String(activeCust),         icon: Users,      color: "#1D9E75", sub: `${customers.length} total` },
          { label: "ARPU",             value: formatUSD(arpu),            icon: TrendingUp, color: "#EF9F27", sub: "per active customer" },
          { label: "MoM growth",       value: `+${growth.toFixed(1)}%`,  icon: ArrowUpRight,color: "#D4537E", sub: "vs May 2024" },
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
            <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR trend + by-plan charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>MRR Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mrrTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatUSD(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="#185FA5" strokeWidth={2.5} dot={{ r: 3, fill: "#185FA5" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Revenue by Plan</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByPlan} barSize={32}>
              <XAxis dataKey="plan" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => formatUSD(Number(val))}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
              {revenueByPlan.map((entry) => (
                <Bar key={entry.plan} dataKey="mrr" name={entry.plan} fill={entry.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan summary */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Revenue by Plan</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {revenueByPlan.map((p) => {
            const pct = Math.round((p.mrr / totalMRR) * 100);
            const plan = pricingPlans.find((pl) => pl.name.startsWith(p.plan));
            return (
              <div key={p.plan} className="rounded-lg border p-3"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.plan}</span>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: p.color + "18", color: p.color }}>{pct}%</span>
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>{formatUSD(p.mrr)}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {p.customers} customer{p.customers !== 1 ? "s" : ""}
                  {plan && ` · ${plan.billingPeriod}`}
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-customer table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b text-sm font-medium"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}>Customer Revenue</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[440px]">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Customer", "Plan", "Status", "MRR", "Share"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customerRevenue.map((c, i) => {
                const pct = Math.round((c.mrr / totalMRR) * 100);
                const s = statusStyle[c.status];
                return (
                  <tr key={c.externalId}
                    style={{ borderBottom: i < customerRevenue.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{c.name}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--muted)" }}>{c.externalId}</div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{c.plan}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: s.bg, color: s.text }}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>{formatUSD(c.mrr)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full flex-1 min-w-[40px]" style={{ background: "var(--border)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: "var(--muted)" }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                <td colSpan={3} className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>Total</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--accent)" }}>{formatUSD(totalMRR)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

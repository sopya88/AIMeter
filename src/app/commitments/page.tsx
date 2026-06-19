"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { formatUSD, formatTokens, formatNumber } from "@/lib/utils";

// ── Mock commitment data ──────────────────────────────────────────────────────
type CommitStatus = "on_track" | "at_risk" | "exceeded" | "completed";

interface Commitment {
  id: string;
  customer: string;
  customerId: string;
  plan: string;
  type: "spend" | "tokens";
  period: "monthly" | "annual";
  commitAmount: number;       // $ or tokens
  usedAmount: number;
  overageRate: number;        // $ per unit over commit
  startDate: string;
  endDate: string;
  status: CommitStatus;
  monthlyDraw: { month: string; used: number; commit: number }[];
}

const commitments: Commitment[] = [
  {
    id: "cm1", customer: "Acme Corp", customerId: "cust_acme",
    plan: "Growth", type: "spend", period: "annual",
    commitAmount: 20000, usedAmount: 9842, overageRate: 1.15,
    startDate: "2024-01-01", endDate: "2024-12-31",
    status: "on_track",
    monthlyDraw: [
      { month: "Jan", used: 1420, commit: 1667 },
      { month: "Feb", used: 1580, commit: 1667 },
      { month: "Mar", used: 1720, commit: 1667 },
      { month: "Apr", used: 1640, commit: 1667 },
      { month: "May", used: 1638, commit: 1667 },
      { month: "Jun", used: 1844, commit: 1667 },
    ],
  },
  {
    id: "cm2", customer: "Zeta AI", customerId: "cust_zeta",
    plan: "Scale", type: "tokens", period: "monthly",
    commitAmount: 50000000, usedAmount: 40300000, overageRate: 0.000025,
    startDate: "2024-06-01", endDate: "2024-06-30",
    status: "at_risk",
    monthlyDraw: [
      { month: "Jun W1", used: 8200000,  commit: 12500000 },
      { month: "Jun W2", used: 12400000, commit: 12500000 },
      { month: "Jun W3", used: 10800000, commit: 12500000 },
      { month: "Jun W4", used: 8900000,  commit: 12500000 },
    ],
  },
  {
    id: "cm3", customer: "Nova Systems", customerId: "cust_nova",
    plan: "Starter", type: "spend", period: "monthly",
    commitAmount: 500, usedAmount: 621, overageRate: 1.20,
    startDate: "2024-06-01", endDate: "2024-06-30",
    status: "exceeded",
    monthlyDraw: [
      { month: "Jun W1", used: 120, commit: 125 },
      { month: "Jun W2", used: 148, commit: 125 },
      { month: "Jun W3", used: 187, commit: 125 },
      { month: "Jun W4", used: 166, commit: 125 },
    ],
  },
  {
    id: "cm4", customer: "Ridge Analytics", customerId: "cust_ridge",
    plan: "Growth", type: "spend", period: "annual",
    commitAmount: 3600, usedAmount: 3600, overageRate: 1.15,
    startDate: "2024-01-01", endDate: "2024-12-31",
    status: "completed",
    monthlyDraw: [
      { month: "Jan", used: 280, commit: 300 },
      { month: "Feb", used: 310, commit: 300 },
      { month: "Mar", used: 295, commit: 300 },
      { month: "Apr", used: 315, commit: 300 },
      { month: "May", used: 300, commit: 300 },
      { month: "Jun", used: 338, commit: 300 },
    ],
  },
];

const statusMeta: Record<CommitStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  on_track:  { label: "On track",  bg: "#DCFCE7", text: "#16A34A", icon: CheckCircle },
  at_risk:   { label: "At risk",   bg: "#FFFBEB", text: "#D97706", icon: AlertTriangle },
  exceeded:  { label: "Exceeded",  bg: "#FEF2F2", text: "#DC2626", icon: AlertTriangle },
  completed: { label: "Completed", bg: "#EFF6FF", text: "#185FA5", icon: CheckCircle },
};

function pct(used: number, commit: number) {
  return Math.min(Math.round((used / commit) * 100), 100);
}
function barColor(status: CommitStatus) {
  if (status === "exceeded") return "#DC2626";
  if (status === "at_risk")  return "#D97706";
  if (status === "completed") return "#185FA5";
  return "#1D9E75";
}

export default function CommitmentsPage() {
  const [selected, setSelected] = useState<string>(commitments[0].id);
  const detail = commitments.find((c) => c.id === selected)!;
  const usedPct = pct(detail.usedAmount, detail.commitAmount);
  const overage = detail.usedAmount > detail.commitAmount
    ? (detail.usedAmount - detail.commitAmount) * detail.overageRate
    : 0;
  const sm = statusMeta[detail.status];

  // Summary stats
  const totalCommit  = commitments.filter((c) => c.type === "spend").reduce((s, c) => s + c.commitAmount, 0);
  const totalUsed    = commitments.filter((c) => c.type === "spend").reduce((s, c) => s + c.usedAmount, 0);
  const exceededCount = commitments.filter((c) => c.status === "exceeded").length;
  const atRiskCount   = commitments.filter((c) => c.status === "at_risk").length;

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Commitments</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Minimum spend & token commitments with overage tracking</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Plus size={14} /><span className="hidden sm:inline">New commitment</span><span className="sm:hidden">New</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total committed (spend)", value: formatUSD(totalCommit),   color: "#185FA5", icon: TrendingUp },
          { label: "Total used (spend)",      value: formatUSD(totalUsed),     color: "#1D9E75", icon: CheckCircle },
          { label: "At-risk commitments",     value: String(atRiskCount),      color: "#D97706", icon: AlertTriangle },
          { label: "Exceeded commitments",    value: String(exceededCount),    color: "#DC2626", icon: AlertTriangle },
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

      <div className="flex flex-col md:flex-row gap-4">
        {/* Commitment list */}
        <div className="md:w-60 flex-shrink-0 flex flex-col gap-2">
          {commitments.map((c) => {
            const s = statusMeta[c.status];
            const p = pct(c.usedAmount, c.commitAmount);
            const active = c.id === selected;
            return (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className="text-left p-3 rounded-lg border transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active ? "var(--accent-light)" : "var(--surface)",
                }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{c.customer}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: s.bg, color: s.text }}>{s.label}</span>
                </div>
                <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                  {c.type === "spend" ? formatUSD(c.usedAmount) : formatTokens(c.usedAmount)} of{" "}
                  {c.type === "spend" ? formatUSD(c.commitAmount) : formatTokens(c.commitAmount)}
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full"
                    style={{ width: `${p}%`, background: barColor(c.status) }} />
                </div>
                <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>{p}% used · {c.period}</div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
          <div className="rounded-lg border p-4 md:p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="font-semibold text-base" style={{ color: "var(--text)" }}>{detail.customer}</div>
                <div className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted)" }}>{detail.customerId}</div>
              </div>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: sm.bg, color: sm.text }}>
                <sm.icon size={11} />{sm.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Commitment type", value: detail.type === "spend" ? "Min. Spend ($)" : "Min. Tokens" },
                { label: "Period",          value: detail.period.charAt(0).toUpperCase() + detail.period.slice(1) },
                { label: "Start date",      value: detail.startDate },
                { label: "End date",        value: detail.endDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--muted)" }}>
                  {detail.type === "spend" ? formatUSD(detail.usedAmount) : formatTokens(detail.usedAmount)} used
                </span>
                <span style={{ color: "var(--muted)" }}>
                  Commit: {detail.type === "spend" ? formatUSD(detail.commitAmount) : formatTokens(detail.commitAmount)}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-3 rounded-full transition-all"
                  style={{ width: `${usedPct}%`, background: barColor(detail.status) }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: barColor(detail.status), fontWeight: 500 }}>{usedPct}% consumed</span>
                {overage > 0 && (
                  <span style={{ color: "#DC2626", fontWeight: 500 }}>
                    Overage: {formatUSD(overage)} ({detail.overageRate}× rate)
                  </span>
                )}
                {overage === 0 && (
                  <span style={{ color: "var(--muted)" }}>
                    {detail.type === "spend"
                      ? formatUSD(detail.commitAmount - detail.usedAmount)
                      : formatTokens(detail.commitAmount - detail.usedAmount)} remaining
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Draw-down chart */}
          <div className="rounded-lg border p-4 md:p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>
              {detail.period === "annual" ? "Monthly Draw-Down vs Commitment" : "Weekly Draw-Down vs Commitment"}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={detail.monthlyDraw} barGap={4} barSize={20}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => detail.type === "spend" ? `$${v}` : formatTokens(v)}
                  tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) =>
                    detail.type === "spend" ? formatUSD(Number(val)) : formatTokens(Number(val))}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--border)" }} />
                <ReferenceLine
                  y={detail.commitAmount / detail.monthlyDraw.length}
                  stroke="#D97706" strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: "Avg commit", position: "insideTopRight", fontSize: 10, fill: "#D97706" }} />
                <Bar dataKey="used"   name="Used"       fill={barColor(detail.status)} radius={[3, 3, 0, 0]} />
                <Bar dataKey="commit" name="Commitment" fill="var(--border)"            radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Commitment terms */}
          <div className="rounded-lg border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
              Commitment Terms
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Committed amount</div>
                <div className="font-semibold" style={{ color: "var(--text)" }}>
                  {detail.type === "spend" ? formatUSD(detail.commitAmount) : formatNumber(detail.commitAmount) + " tokens"}
                </div>
              </div>
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>Overage rate</div>
                <div className="font-semibold" style={{ color: "var(--text)" }}>
                  {detail.type === "spend"
                    ? `${detail.overageRate}× list price`
                    : `$${detail.overageRate.toFixed(6)} / token`}
                </div>
              </div>
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>
                  {overage > 0 ? "Overage charge" : "Projected overage"}
                </div>
                <div className="font-semibold" style={{ color: overage > 0 ? "#DC2626" : "var(--muted)" }}>
                  {overage > 0 ? formatUSD(overage) : "None"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

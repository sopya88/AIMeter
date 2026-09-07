"use client";
import { useState } from "react";
import { Users, AlertTriangle, CheckCircle, Clock, Search, Download } from "lucide-react";
import { licenses, type LicenseStatus, type LicenseType } from "@/data/mock";
import { formatINR } from "@/lib/utils";

const licenseColors: Record<LicenseType, string> = {
  "Microsoft 365 Copilot":      "#EA580C",
  "GitHub Copilot":              "#1A1D23",
  "Claude for Work":             "#1D9E75",
  "Gemini Advanced":             "#EF9F27",
  "OpenAI ChatGPT Enterprise":   "#378ADD",
};

const statusMeta: Record<LicenseStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  active:   { label: "Active",   bg: "#DCFCE7", text: "#16A34A", icon: CheckCircle },
  inactive: { label: "Inactive", bg: "#F3F4F6", text: "#6B7280", icon: Clock },
  pending:  { label: "Pending",  bg: "#FFF7ED", text: "#EA580C", icon: Clock },
  unused:   { label: "Unused",   bg: "#FEF3C7", text: "#D97706", icon: AlertTriangle },
};

const ALL_TYPES: LicenseType[] = [
  "Microsoft 365 Copilot", "GitHub Copilot", "Claude for Work", "Gemini Advanced", "OpenAI ChatGPT Enterprise",
];

export default function LicensesPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<LicenseStatus | "all">("all");
  const [deptFilter, setDept]     = useState("all");

  const filtered = licenses.filter((l) => {
    const matchSearch = l.employee.toLowerCase().includes(search.toLowerCase())
      || l.department.toLowerCase().includes(search.toLowerCase())
      || l.licenseType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchDept   = deptFilter === "all" || l.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const totalMonthlyINR = licenses.reduce((s, l) => s + l.monthlySpendINR, 0);
  const unusedCount     = licenses.filter((l) => l.status === "unused").length;
  const unusedSpend     = licenses.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0);
  const activeCount     = licenses.filter((l) => l.status === "active").length;

  const byType = ALL_TYPES.map((type) => {
    const rows = licenses.filter((l) => l.licenseType === type);
    return {
      type,
      total:    rows.length,
      active:   rows.filter((l) => l.status === "active").length,
      unused:   rows.filter((l) => l.status === "unused").length,
      spendINR: rows.reduce((s, l) => s + l.monthlySpendINR, 0),
      color:    licenseColors[type],
    };
  }).filter((t) => t.total > 0);

  const depts = Array.from(new Set(licenses.map((l) => l.department)));

  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>
            AI License Management
          </h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Employee-wise AI tool allocation · INR billing · Unused license alerts
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--surface)" }}>
          <Download size={13} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Monthly Spend",  value: formatINR(totalMonthlyINR), sub: `${licenses.length} licenses`,         color: "#EA580C", icon: Users },
          { label: "Active Licenses",      value: String(activeCount),        sub: `${licenses.length} total allocated`,  color: "#1D9E75", icon: CheckCircle },
          { label: "Unused Licenses",      value: String(unusedCount),        sub: "No activity 30+ days",                color: "#D97706", icon: AlertTriangle },
          { label: "Unused License Cost",  value: formatINR(unusedSpend),     sub: "Potential monthly saving",            color: "#DC2626", icon: AlertTriangle },
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

      {/* License type breakdown */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>License Breakdown by Product</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {byType.map((t) => (
            <div key={t.type} className="rounded-lg border p-3"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <div className="text-xs font-medium leading-tight" style={{ color: "var(--text)" }}>{t.type}</div>
              </div>
              <div className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>{t.total}</div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                {t.active} active · {t.unused} unused
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: t.color }}>{formatINR(t.spendINR)}/mo</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] px-3 py-2 rounded-md border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Search size={13} style={{ color: "var(--muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, department, tool..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: "var(--text)" }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "active", "unused", "inactive", "pending"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border capitalize"
              style={statusFilter === s
                ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDept(e.target.value)}
          className="px-2.5 py-1.5 rounded-md text-xs border outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
          <option value="all">All departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* License table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-4 py-2.5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            {filtered.length} of {licenses.length} licenses
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>Monthly cost in INR</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Department", "Role", "License / Tool", "Status", "Last Used", "Monthly Cost", "Unused Days"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const sm = statusMeta[l.status];
                const lcolor = licenseColors[l.licenseType];
                return (
                  <tr key={l.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{l.employee}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{l.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{l.department}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{l.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lcolor }} />
                        <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{l.licenseType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium"
                        style={{ background: sm.bg, color: sm.text }}>
                        <sm.icon size={10} />{sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: l.lastUsed ? "var(--text)" : "var(--muted)" }}>
                      {l.lastUsed ?? "Never"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text)" }}>
                      {formatINR(l.monthlySpendINR)}
                    </td>
                    <td className="px-4 py-3">
                      {l.unusedDays > 0
                        ? <span className="text-xs font-semibold" style={{ color: "#D97706" }}>{l.unusedDays}d</span>
                        : <span className="text-xs" style={{ color: "var(--muted)" }}>-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-4 py-3 border-t flex flex-wrap gap-4"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Total (filtered):{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {formatINR(filtered.reduce((s, l) => s + l.monthlySpendINR, 0))}/mo
            </span>
          </div>
          <div className="text-xs" style={{ color: "#D97706" }}>
            Unused waste:{" "}
            <span className="font-semibold">
              {formatINR(filtered.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0))}/mo
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            IGST (18%):{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {formatINR(filtered.reduce((s, l) => s + l.monthlySpendINR, 0) * 0.18)}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

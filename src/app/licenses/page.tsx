"use client";
import { useState } from "react";
import { Users, AlertTriangle, CheckCircle, Clock, Search, Download, Plus, X, Info } from "lucide-react";
import { licenses as seedLicenses, type LicenseStatus, type LicenseType } from "@/data/mock";
import { formatEUR } from "@/lib/utils";

// ── Per-seat pricing reference (EUR/month) ───────────────────────────────────
const TOOL_PRICING: {
  type: LicenseType;
  color: string;
  usdPerSeat: number;
  inrPerSeat: number;
  tier: string;
  includes: string[];
}[] = [
  {
    type: "Microsoft 365 Copilot",
    color: "#EA580C", usdPerSeat: 30, inrPerSeat: 28,
    tier: "M365 Copilot",
    includes: ["Word/Excel/Outlook AI", "Teams meeting summaries", "Copilot Studio"],
  },
  {
    type: "GitHub Copilot",
    color: "#1A1D23", usdPerSeat: 19, inrPerSeat: 18,
    tier: "Business",
    includes: ["Code completion", "Chat in IDE", "PR summaries", "CLI"],
  },
  {
    type: "Claude for Work",
    color: "#1D9E75", usdPerSeat: 20, inrPerSeat: 19,
    tier: "Team",
    includes: ["Claude 3.5 Sonnet", "100K context", "Projects", "API access"],
  },
  {
    type: "Gemini Advanced",
    color: "#EF9F27", usdPerSeat: 20, inrPerSeat: 19,
    tier: "Google One AI Premium",
    includes: ["Gemini 1.5 Pro", "1M token context", "NotebookLM Plus", "Workspace integration"],
  },
  {
    type: "OpenAI ChatGPT Enterprise",
    color: "#378ADD", usdPerSeat: 25, inrPerSeat: 23,
    tier: "Enterprise",
    includes: ["GPT-4o", "Unlimited usage", "Admin controls", "SSO/SAML", "No data training"],
  },
];

const licenseColors: Record<LicenseType, string> = Object.fromEntries(
  TOOL_PRICING.map((t) => [t.type, t.color])
) as Record<LicenseType, string>;

const statusMeta: Record<LicenseStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  active:   { label: "Active",   bg: "#DCFCE7", text: "#16A34A", icon: CheckCircle },
  inactive: { label: "Inactive", bg: "#F3F4F6", text: "#6B7280", icon: Clock },
  pending:  { label: "Pending",  bg: "#FFF7ED", text: "#EA580C", icon: Clock },
  unused:   { label: "Unused",   bg: "#FEF3C7", text: "#D97706", icon: AlertTriangle },
};

const DEPARTMENTS = [
  "Engineering", "Product & Design", "Data Science",
  "Sales & Marketing", "Finance & Legal", "Customer Success",
];

type LicenseRow = typeof seedLicenses[number];

const blankForm = {
  employee: "", email: "", department: DEPARTMENTS[0],
  role: "", licenseType: TOOL_PRICING[0].type as LicenseType,
};

export default function LicensesPage() {
  const [rows, setRows]           = useState<LicenseRow[]>(seedLicenses as LicenseRow[]);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<LicenseStatus | "all">("all");
  const [deptFilter, setDept]     = useState("all");
  const [showAdd, setShowAdd]     = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [editPricing, setEditPricing] = useState(false);
  const [pricingState, setPricingState] = useState(TOOL_PRICING.map((t) => ({ ...t })));
  const [form, setForm]           = useState(blankForm);
  const [formError, setFormError] = useState("");

  const pricing = pricingState.find((t) => t.type === form.licenseType)!;

  const filtered = rows.filter((l) => {
    const matchSearch = l.employee.toLowerCase().includes(search.toLowerCase())
      || l.department.toLowerCase().includes(search.toLowerCase())
      || l.licenseType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchDept   = deptFilter === "all" || l.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const totalMonthlyINR = rows.reduce((s, l) => s + l.monthlySpendINR, 0);
  const unusedCount     = rows.filter((l) => l.status === "unused").length;
  const unusedSpend     = rows.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0);
  const activeCount     = rows.filter((l) => l.status === "active").length;

  const byType = pricingState.map((t) => {
    const typeRows = rows.filter((l) => l.licenseType === t.type);
    return {
      ...t,
      total:   typeRows.length,
      active:  typeRows.filter((l) => l.status === "active").length,
      unused:  typeRows.filter((l) => l.status === "unused").length,
      spendINR: typeRows.reduce((s, l) => s + l.monthlySpendINR, 0),
    };
  }).filter((t) => t.total > 0);

  function handleAdd() {
    if (!form.employee.trim()) { setFormError("Employee name is required"); return; }
    if (!form.email.trim())    { setFormError("Email is required"); return; }
    if (!form.role.trim())     { setFormError("Role is required"); return; }
    const newRow: LicenseRow = {
      id:              `l${Date.now()}`,
      employee:        form.employee.trim(),
      email:           form.email.trim(),
      department:      form.department,
      role:            form.role.trim(),
      licenseType:     form.licenseType,
      status:          "pending",
      lastUsed:        null,
      monthlySpendINR: pricing.inrPerSeat,
      allocatedDate:   new Date().toISOString().slice(0, 10),
      unusedDays:      0,
    };
    setRows((prev) => [newRow, ...prev]);
    setForm(blankForm);
    setFormError("");
    setShowAdd(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>
            AI License Management
          </h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Employee-wise AI tool allocation · EUR billing · Unused license alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPricing((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--surface)" }}>
            <Info size={13} />
            <span className="hidden sm:inline">Pricing</span>
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}>
            <Plus size={13} />
            <span className="hidden sm:inline">Add License</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* ── Pricing reference panel ──────────────────────────────────── */}
      {showPricing && (
        <div className="rounded-lg border mb-5 overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>AI Tool Pricing Reference</div>
            <div className="flex items-center gap-3">
              <div className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>Per seat · per month · EUR + 20% VAT</div>
              <button
                onClick={() => setEditPricing((v) => !v)}
                className="text-xs px-2.5 py-1 rounded-md border font-medium"
                style={editPricing
                  ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                  : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
                {editPricing ? "Done" : "Edit Rates"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 divide-x divide-y"
            style={{ borderColor: "var(--border)" }}>
            {pricingState.map((t, idx) => (
              <div key={t.type} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <div className="text-xs font-semibold leading-tight" style={{ color: "var(--text)" }}>{t.type}</div>
                </div>
                <div className="text-[10px] mb-2 px-1.5 py-0.5 rounded w-fit"
                  style={{ background: t.color + "14", color: t.color }}>{t.tier}</div>
                {editPricing ? (
                  <div className="mb-2">
                    <label className="text-[10px] block mb-1" style={{ color: "var(--muted)" }}>EUR/seat/month</label>
                    <input
                      type="number" min={0}
                      value={t.inrPerSeat}
                      onChange={(e) => setPricingState((prev) => prev.map((p, i) =>
                        i === idx ? { ...p, inrPerSeat: Number(e.target.value) } : p
                      ))}
                      className="w-full text-sm px-2 py-1 rounded border outline-none font-semibold"
                      style={{ borderColor: t.color, color: "var(--text)", background: "var(--bg)" }}
                    />
                    <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                      VAT: {formatEUR(t.inrPerSeat * 0.20)} · Total: {formatEUR(t.inrPerSeat * 1.20)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-1">
                      <span className="text-lg font-bold" style={{ color: "var(--text)" }}>{formatEUR(t.inrPerSeat)}</span>
                      <span className="text-[10px] ml-1" style={{ color: "var(--muted)" }}>/seat/mo</span>
                    </div>
                    <div className="text-[10px] mb-2" style={{ color: "var(--muted)" }}>
                      +{formatEUR(t.inrPerSeat * 0.20)} VAT
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-0.5">
                  {t.includes.map((item) => (
                    <div key={item} className="flex items-start gap-1 text-[10px]" style={{ color: "var(--muted)" }}>
                      <span style={{ color: t.color }}>+</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t text-[10px]"
            style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--muted)" }}>
            Note: Rates are editable — changes apply to new license allocations. VAT (20%) applies per EU regulations. WHT may apply per local tax rules.
          </div>
        </div>
      )}

      {/* ── Add License modal ──────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="w-full max-w-md rounded-xl shadow-xl overflow-hidden"
            style={{ background: "var(--surface)" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Add AI License</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Allocate an AI tool license to an employee
                </div>
              </div>
              <button onClick={() => setShowAdd(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: "var(--bg)", color: "var(--muted)" }}>
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Tool selector */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text)" }}>
                  AI Tool / License Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {pricingState.map((t) => (
                    <label key={t.type}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors"
                      style={{
                        borderColor: form.licenseType === t.type ? t.color : "var(--border)",
                        background:  form.licenseType === t.type ? t.color + "10" : "var(--bg)",
                      }}>
                      <div className="flex items-center gap-2.5">
                        <input type="radio" name="licenseType" value={t.type}
                          checked={form.licenseType === t.type}
                          onChange={() => setForm((f) => ({ ...f, licenseType: t.type }))}
                          className="accent-orange-600" />
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                        <div>
                          <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{t.type}</div>
                          <div className="text-[10px]" style={{ color: "var(--muted)" }}>{t.tier}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold flex-shrink-0" style={{ color: t.color }}>
                        {formatEUR(t.inrPerSeat)}/mo
                      </div>
                    </label>
                  ))}
                </div>
                {/* Cost callout */}
                <div className="mt-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: "var(--accent)" + "12", color: "var(--accent)" }}>
                  Seat cost: <strong>{formatEUR(pricing.inrPerSeat)}/month</strong> + {formatEUR(pricing.inrPerSeat * 0.20)} VAT
                  = <strong>{formatEUR(pricing.inrPerSeat * 1.20)} total</strong>
                </div>
              </div>

              {/* Employee details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                    Employee Name <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    value={form.employee}
                    onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                    placeholder="e.g. Ananya Verma"
                    className="w-full px-3 py-2 rounded-md border text-xs outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                    Work Email <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ananya.verma@company.in"
                    className="w-full px-3 py-2 rounded-md border text-xs outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                    Department <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border text-xs outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                    Role / Designation <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Senior SDE"
                    className="w-full px-3 py-2 rounded-md border text-xs outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
              </div>

              {formError && (
                <div className="text-xs px-3 py-2 rounded-md"
                  style={{ background: "#FEF2F2", color: "#DC2626" }}>
                  {formError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-2 px-5 py-4 border-t"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <button onClick={handleAdd}
                className="flex-1 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}>
                Allocate License
              </button>
              <button onClick={() => { setShowAdd(false); setFormError(""); setForm(blankForm); }}
                className="px-4 py-2 rounded-md text-sm font-medium border"
                style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--surface)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Monthly Spend",  value: formatEUR(totalMonthlyINR), sub: `${rows.length} licenses`,        color: "#EA580C", icon: Users },
          { label: "Active Licenses",      value: String(activeCount),        sub: `${rows.length} total allocated`, color: "#1D9E75", icon: CheckCircle },
          { label: "Unused Licenses",      value: String(unusedCount),        sub: "No activity 30+ days",           color: "#D97706", icon: AlertTriangle },
          { label: "Unused License Cost",  value: formatEUR(unusedSpend),     sub: "Potential monthly saving",       color: "#DC2626", icon: AlertTriangle },
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
              <div className="text-lg font-semibold mb-0.5" style={{ color: "var(--text)" }}>{t.total}</div>
              <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                {t.active} active · {t.unused} unused
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: t.color }}>{formatEUR(t.spendINR)}/mo</div>
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
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* License table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-4 py-2.5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            {filtered.length} of {rows.length} licenses
          </span>
          <button className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
            <Download size={11} />Export CSV
          </button>
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
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                        {formatEUR(l.monthlySpendINR)}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--muted)" }}>
                        +{formatEUR(l.monthlySpendINR * 0.20)} VAT
                      </div>
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
            Total:{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {formatEUR(filtered.reduce((s, l) => s + l.monthlySpendINR, 0))}/mo
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            VAT (20%):{" "}
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {formatEUR(filtered.reduce((s, l) => s + l.monthlySpendINR, 0) * 0.20)}/mo
            </span>
          </div>
          <div className="text-xs" style={{ color: "#D97706" }}>
            Unused waste:{" "}
            <span className="font-semibold">
              {formatEUR(filtered.filter((l) => l.status === "unused").reduce((s, l) => s + l.monthlySpendINR, 0))}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

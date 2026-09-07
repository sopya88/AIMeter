"use client";
import { useState } from "react";
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { gstInvoices, departments, type InvoiceStatus, type InvoiceVendor } from "@/data/mock";
import { formatINR, formatNumber } from "@/lib/utils";

const statusMeta: Record<InvoiceStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  paid:    { label: "Paid",    bg: "#DCFCE7", text: "#16A34A", icon: CheckCircle },
  pending: { label: "Pending", bg: "#FEF3C7", text: "#D97706", icon: Clock },
  overdue: { label: "Overdue", bg: "#FEF2F2", text: "#DC2626", icon: AlertTriangle },
};

const vendorColors: Record<InvoiceVendor, string> = {
  "Microsoft Azure": "#EA580C",
  "OpenAI":          "#378ADD",
  "Anthropic":       "#1D9E75",
  "Google Cloud":    "#EF9F27",
  "GitHub":          "#1A1D23",
  "AWS Bedrock":     "#D4537E",
};

// Monthly trend for chart
const monthlySpend = [
  { month: "Jan", amountINR: 380000 },
  { month: "Feb", amountINR: 412000 },
  { month: "Mar", amountINR: 448000 },
  { month: "Apr", amountINR: 392000 },
  { month: "May", amountINR: 506000 },
  { month: "Jun", amountINR: 468200 },
];

export default function AuditPage() {
  const [statusFilter, setStatus] = useState<InvoiceStatus | "all">("all");
  const [selected, setSelected]   = useState<string>(gstInvoices[0].id);
  const [activeTab, setActiveTab] = useState<"invoices" | "departments" | "trend">("invoices");

  const filtered = gstInvoices.filter(
    (inv) => statusFilter === "all" || inv.status === statusFilter
  );

  const detail = gstInvoices.find((inv) => inv.id === selected);

  const totalAmountINR  = gstInvoices.reduce((s, inv) => s + inv.amountINR, 0);
  const totalIGSTINR    = gstInvoices.reduce((s, inv) => s + inv.igstINR, 0);
  const totalTDSINR     = gstInvoices.reduce((s, inv) => s + inv.tdsINR, 0);
  const totalPayableINR = gstInvoices.reduce((s, inv) => s + inv.netPayableINR, 0);
  const overdueCount    = gstInvoices.filter((inv) => inv.status === "overdue").length;

  // Vendor aggregation
  const byVendor = Object.entries(
    gstInvoices.reduce<Record<string, { totalINR: number; count: number }>>((acc, inv) => {
      if (!acc[inv.vendor]) acc[inv.vendor] = { totalINR: 0, count: 0 };
      acc[inv.vendor].totalINR += inv.totalINR;
      acc[inv.vendor].count    += 1;
      return acc;
    }, {})
  ).map(([vendor, v]) => ({ vendor, ...v })).sort((a, b) => b.totalINR - a.totalINR);

  // Dept aggregation
  const byDept = Object.entries(
    gstInvoices.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.department] = (acc[inv.department] ?? 0) + inv.totalINR;
      return acc;
    }, {})
  ).map(([dept, totalINR]) => ({ dept, totalINR })).sort((a, b) => b.totalINR - a.totalINR);

  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>
            Audit & GST Reports
          </h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            GST invoice tracking · IGST 18% · TDS 2% · Cost-centre allocation
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--surface)" }}>
          <Download size={13} />
          <span className="hidden sm:inline">Export GSTR-2A</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total AI Spend (ex-GST)", value: formatINR(totalAmountINR), color: "#EA580C", icon: Building2 },
          { label: "Total IGST (18%)",         value: formatINR(totalIGSTINR),   color: "#EF9F27", icon: FileText },
          { label: "TDS Deducted (2%)",        value: formatINR(totalTDSINR),    color: "#1D9E75", icon: CheckCircle },
          { label: "Overdue Invoices",          value: String(overdueCount),      color: "#DC2626", icon: AlertTriangle },
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

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
        {([
          { key: "invoices",    label: "GST Invoices" },
          { key: "departments", label: "Dept Allocation" },
          { key: "trend",       label: "Monthly Trend" },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={activeTab === key
              ? { borderColor: "var(--accent)", color: "var(--accent)" }
              : { borderColor: "transparent", color: "var(--muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Invoice tab */}
      {activeTab === "invoices" && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Invoice list */}
          <div className="flex-1">
            {/* Status filter */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {(["all", "paid", "pending", "overdue"] as const).map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium border capitalize"
                  style={statusFilter === s
                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                    : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            <div className="rounded-lg border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      {["Invoice No.", "Vendor", "Month", "Amount", "IGST 18%", "TDS 2%", "Net Payable", "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 text-xs font-medium"
                          style={{ color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv, i) => {
                      const sm = statusMeta[inv.status];
                      const vColor = vendorColors[inv.vendor];
                      const isSelected = inv.id === selected;
                      return (
                        <tr key={inv.id}
                          onClick={() => setSelected(inv.id)}
                          className="cursor-pointer"
                          style={{
                            borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                            background: isSelected ? "var(--accent-light)" : "transparent",
                          }}>
                          <td className="px-3 py-2.5">
                            <div className="text-xs font-mono font-medium" style={{ color: "var(--text)" }}>{inv.invoiceNo}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: vColor }} />
                              <span className="text-xs" style={{ color: "var(--text)" }}>{inv.vendor}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: "var(--muted)" }}>{inv.month}</td>
                          <td className="px-3 py-2.5 text-xs font-medium" style={{ color: "var(--text)" }}>{formatINR(inv.amountINR)}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: "#D97706" }}>{formatINR(inv.igstINR)}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: "#1D9E75" }}>{formatINR(inv.tdsINR)}</td>
                          <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: "var(--accent)" }}>{formatINR(inv.netPayableINR)}</td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full w-fit font-medium"
                              style={{ background: sm.bg, color: sm.text }}>
                              <sm.icon size={9} />{sm.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                      <td colSpan={3} className="px-3 py-2.5 text-xs font-semibold" style={{ color: "var(--text)" }}>Total</td>
                      <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: "var(--text)" }}>
                        {formatINR(filtered.reduce((s, i) => s + i.amountINR, 0))}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: "#D97706" }}>
                        {formatINR(filtered.reduce((s, i) => s + i.igstINR, 0))}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: "#1D9E75" }}>
                        {formatINR(filtered.reduce((s, i) => s + i.tdsINR, 0))}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: "var(--accent)" }}>
                        {formatINR(filtered.reduce((s, i) => s + i.netPayableINR, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Invoice detail */}
          {detail && (
            <div className="md:w-72 flex-shrink-0">
              <div className="rounded-lg border p-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Invoice Detail</div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: vendorColors[detail.vendor] }} />
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{detail.vendor}</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Invoice No.",    value: detail.invoiceNo },
                    { label: "Month",          value: detail.month },
                    { label: "Cost Centre",    value: detail.costCenter },
                    { label: "Department",     value: detail.department },
                    { label: "Vendor GSTIN",   value: detail.vendorGSTIN },
                    { label: "Our GSTIN",      value: detail.ourGSTIN },
                    { label: "PAN",            value: detail.pan },
                    { label: "Due Date",       value: detail.dueDate },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
                      <div className="text-xs font-medium font-mono" style={{ color: "var(--text)" }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                  {[
                    { label: "Base Amount",  value: formatINR(detail.amountINR),      color: "var(--text)" },
                    { label: "IGST (18%)",   value: `+ ${formatINR(detail.igstINR)}`, color: "#D97706" },
                    { label: "TDS (2%)",     value: `âˆ’ ${formatINR(detail.tdsINR)}`,  color: "#1D9E75" },
                    { label: "Net Payable",  value: formatINR(detail.netPayableINR),  color: "var(--accent)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span style={{ color: "var(--muted)" }}>{label}</span>
                      <span className="font-semibold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border"
                  style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--bg)" }}>
                  <Download size={12} />Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dept allocation tab */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>AI Spend by Department</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDept} barSize={28} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => formatINR(Number(val))}
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }} />
                <Bar dataKey="totalINR" name="Total Spend (INR)" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b text-sm font-medium"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              Cost-Centre Allocation
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                    {["Department", "Cost Centre", "Budget", "Spent", "Used%"].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d, i) => {
                    const spent = gstInvoices
                      .filter((inv) => inv.department === d.name)
                      .reduce((s, inv) => s + inv.totalINR, 0);
                    const pct = Math.round((d.spentINR / d.budgetINR) * 100);
                    const overBudget = pct > 90;
                    return (
                      <tr key={d.id}
                        style={{ borderBottom: i < departments.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <td className="px-4 py-2.5 text-xs font-medium" style={{ color: "var(--text)" }}>{d.name}</td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: "var(--muted)" }}>{d.costCenter}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text)" }}>{formatINR(d.budgetINR)}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text)" }}>{formatINR(d.spentINR)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full" style={{ background: "var(--border)" }}>
                              <div className="h-1.5 rounded-full"
                                style={{ width: `${Math.min(pct, 100)}%`, background: overBudget ? "#DC2626" : "var(--accent)" }} />
                            </div>
                            <span className="text-xs" style={{ color: overBudget ? "#DC2626" : "var(--muted)" }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly trend tab */}
      {activeTab === "trend" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Monthly AI Spend (INR)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlySpend} barSize={36}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => formatINR(Number(val))}
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }} />
                <Bar dataKey="amountINR" name="Spend (INR)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>Vendor Spend Summary</div>
            <div className="flex flex-col gap-2">
              {byVendor.map((v) => {
                const pct = Math.round((v.totalINR / gstInvoices.reduce((s, i) => s + i.totalINR, 0)) * 100);
                const color = vendorColors[v.vendor as InvoiceVendor] ?? "#6B7280";
                return (
                  <div key={v.vendor}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span style={{ color: "var(--text)" }}>{v.vendor}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium" style={{ color: "var(--text)" }}>{formatINR(v.totalINR)}</span>
                        <span style={{ color: "var(--muted)" }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


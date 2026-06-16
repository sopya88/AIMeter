"use client";
import { useState } from "react";
import { Download, CheckCircle, Clock } from "lucide-react";
import { invoices, chargebacks, topTeams, PROVIDER_COLORS } from "@/data/mock";
import { formatINR } from "@/lib/utils";

const totalBudget = topTeams.reduce((s, t) => s + t.budget, 0);
const totalSpend = topTeams.reduce((s, t) => s + t.spend, 0);
const budgetPct = Math.round((totalSpend / totalBudget) * 100);

export default function Billing() {
  const [tab, setTab] = useState<"invoices" | "chargebacks">("invoices");

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Billing</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Invoices, chargebacks & budget tracker</p>
      </div>

      {/* Budget Tracker */}
      <div className="rounded-lg border p-5 mb-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Overall Budget — June 2024</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>All teams combined</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold" style={{ color: "var(--text)" }}>{formatINR(totalSpend)}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>of {formatINR(totalBudget)} budget</div>
          </div>
        </div>
        <div className="h-2 rounded-full mb-1" style={{ background: "var(--border)" }}>
          <div className="h-2 rounded-full transition-all"
            style={{ width: `${budgetPct}%`, background: budgetPct >= 80 ? "#DC2626" : "var(--accent)" }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
          <span>{budgetPct}% consumed</span>
          <span>{formatINR(totalBudget - totalSpend)} remaining</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
        {(["invoices", "chargebacks"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium capitalize -mb-px transition-colors"
            style={tab === t
              ? { color: "var(--accent)", borderBottom: "2px solid var(--accent)" }
              : { color: "var(--muted)" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "invoices" ? (
        <div className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                {["Invoice ID", "Date", "Provider", "Amount", "IGST 18%", "Total (incl. GST)", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id}
                  style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text)" }}>{inv.id}</td>
                  <td className="px-4 py-3" style={{ color: "var(--muted)" }}>{inv.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: PROVIDER_COLORS[inv.provider as keyof typeof PROVIDER_COLORS] + "18", color: PROVIDER_COLORS[inv.provider as keyof typeof PROVIDER_COLORS] }}>
                      {inv.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{formatINR(inv.amount)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--muted)" }}>{formatINR(inv.igst)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{formatINR(inv.total)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs">
                      {inv.status === "paid"
                        ? <><CheckCircle size={12} color="#1D9E75" /><span style={{ color: "#1D9E75" }}>Paid</span></>
                        : <><Clock size={12} color="#D97706" /><span style={{ color: "#D97706" }}>Pending</span></>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                      <Download size={11} />PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                {["CC Code", "Team", "OpenAI", "Anthropic", "Google", "AWS", "Total"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chargebacks.map((c, i) => (
                <tr key={c.cc}
                  style={{ borderBottom: i < chargebacks.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{c.cc}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{c.team}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{formatINR(c.openai)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{formatINR(c.anthropic)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{formatINR(c.google)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text)" }}>{formatINR(c.aws)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{formatINR(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

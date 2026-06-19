"use client";
import { useState } from "react";
import { Search, Users, TrendingUp } from "lucide-react";
import { customers, pricingPlans } from "@/data/mock";
import { formatUSD, formatTokens } from "@/lib/utils";

const statusStyle = {
  active:   { bg: "#DCFCE7", text: "#16A34A" },
  inactive: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.externalId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Customers</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Your end-customers and their token usage</p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          {customers.filter((c) => c.status === "active").length} active
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total customers", value: String(customers.length) },
          { label: "Active",          value: String(customers.filter((c) => c.status === "active").length) },
          { label: "Total billed",    value: formatUSD(customers.reduce((s, c) => s + c.totalCost, 0)) },
          { label: "Avg cost",        value: formatUSD(customers.reduce((s, c) => s + c.totalCost, 0) / customers.length) },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border p-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</div>
            <div className="text-xl font-semibold" style={{ color: "var(--text)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-1.5 border rounded-md px-3 py-2 mb-4 max-w-sm"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <Search size={13} style={{ color: "var(--muted)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          className="text-sm outline-none bg-transparent w-full"
          style={{ color: "var(--text)" }} />
      </div>

      {/* Customer cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((customer) => {
          const s = statusStyle[customer.status];
          const plan = pricingPlans.find((p) => p.name.startsWith(customer.plan));
          const totalTokens = customer.inputTokens + customer.outputTokens;

          return (
            <div key={customer.id} className="rounded-lg border p-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: identity */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent-light)" }}>
                    <Users size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{customer.name}</div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{customer.externalId}</div>
                  </div>
                </div>

                {/* Right: status + plan */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.text }}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    {customer.plan}
                  </span>
                  {plan && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: plan.status === "active" ? "#DCFCE7" : "#F3F4F6", color: plan.status === "active" ? "#16A34A" : "#6B7280" }}>
                      Plan {plan.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Input tokens",  value: formatTokens(customer.inputTokens) },
                  { label: "Output tokens", value: formatTokens(customer.outputTokens) },
                  { label: "Total tokens",  value: formatTokens(totalTokens) },
                  { label: "Total cost",    value: formatUSD(customer.totalCost), highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="rounded-md p-2.5"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <div className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
                    <div className="text-sm font-semibold flex items-center gap-1"
                      style={{ color: highlight ? "var(--accent)" : "var(--text)" }}>
                      {highlight && <TrendingUp size={11} />}
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Customer since {new Date(customer.since).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

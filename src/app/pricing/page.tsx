"use client";
import { useState } from "react";
import { Lock, Plus, ChevronRight } from "lucide-react";
import { pricingPlans, type PricingPlan } from "@/data/mock";
import { formatUSD } from "@/lib/utils";

const statusStyle: Record<string, { bg: string; text: string }> = {
  active:   { bg: "#DCFCE7", text: "#16A34A" },
  draft:    { bg: "#F3F4F6", text: "#6B7280" },
  archived: { bg: "#FEF2F2", text: "#DC2626" },
};

function PlanCard({ plan, onClick, active }: { plan: PricingPlan; onClick: () => void; active: boolean }) {
  const s = statusStyle[plan.status];
  return (
    <button onClick={onClick}
      className="w-full text-left p-4 rounded-lg border transition-colors"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active ? "var(--accent-light)" : "var(--surface)",
      }}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{plan.name}</div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ background: s.bg, color: s.text }}>
          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
        </span>
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{plan.billingPeriod}</div>
    </button>
  );
}

function PlanDetail({ plan }: { plan: PricingPlan }) {
  const locked = plan.status === "active";
  const s = statusStyle[plan.status];

  return (
    <div>
      {/* Plan header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>{plan.name}</h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{ background: s.bg, color: s.text }}>
          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
        </span>
        {locked && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full"
            style={{ background: "#FEF3C7", color: "#D97706" }}>
            <Lock size={11} />Read-only — create a new version to edit
          </span>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
          Pricing plan information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Plan name", value: plan.name },
            { label: "Description", value: plan.description },
            { label: "Billing period", value: plan.billingPeriod },
            { label: "Pricing plan model", value: plan.model },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[11px] mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
              {locked
                ? <div className="text-sm" style={{ color: "var(--text)" }}>{value}</div>
                : <input defaultValue={value}
                    className="w-full text-sm px-3 py-1.5 rounded-md border outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              }
            </div>
          ))}
        </div>
      </div>

      {/* Price catalog */}
      <div className="rounded-lg border p-4 mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Price Catalog
          </div>
          {!locked && (
            <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
              <Plus size={11} />Add product item
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {plan.productItems.map((item) => (
            <div key={item.id} className="rounded-md border p-3"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{item.meter}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--muted)" }}>
                  {item.description}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {item.tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span style={{ color: "var(--muted)" }}>
                      {i === 0 && tier.upTo !== null
                        ? `First ${tier.upTo.toLocaleString()} units`
                        : tier.upTo !== null
                          ? `${item.tiers[i - 1].upTo!.toLocaleString()+1} – ${tier.upTo.toLocaleString()}`
                          : "Everything after"}
                    </span>
                    <ChevronRight size={10} style={{ color: "var(--border)" }} />
                    <span style={{ color: tier.unitRate === 0 ? "#16A34A" : "var(--text)", fontWeight: 500 }}>
                      {tier.unitRate === 0 ? "Free" : `$${tier.unitRate.toFixed(6)} / unit`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed fees */}
      <div className="rounded-lg border p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Fixed Fees
          </div>
          {!locked && (
            <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
              <Plus size={11} />Add fee
            </button>
          )}
        </div>
        {plan.fixedFees.length === 0
          ? <div className="text-xs" style={{ color: "var(--muted)" }}>No fixed fees</div>
          : (
            <div className="flex flex-col gap-2">
              {plan.fixedFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between rounded-md p-2.5 border"
                  style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{fee.description}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {formatUSD(fee.amount)} / {fee.period}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [selectedId, setSelectedId] = useState(pricingPlans[0].id);
  const selected = pricingPlans.find((p) => p.id === selectedId)!;

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Pricing Plans</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>What you charge your customers</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Plus size={14} /><span className="hidden sm:inline">New plan</span><span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Plan list */}
        <div className="md:w-56 flex-shrink-0 flex flex-col gap-2">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} active={plan.id === selectedId}
              onClick={() => setSelectedId(plan.id)} />
          ))}
        </div>

        {/* Plan detail */}
        <div className="flex-1 min-w-0">
          <PlanDetail plan={selected} />
        </div>
      </div>
    </div>
  );
}

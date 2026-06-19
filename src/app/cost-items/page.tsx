"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { costItems, meters, type CostItem, type RateModel, type DimensionRow } from "@/data/mock";

const RATE_MODELS: { value: RateModel; label: string; desc: string }[] = [
  { value: "per_unit",   label: "Per unit",   desc: "Fixed rate multiplied by quantity" },
  { value: "per_block",  label: "Per block",  desc: "Rate per N units" },
  { value: "tiered",     label: "Tiered",     desc: "Different rates at different volume bands" },
  { value: "dimensions", label: "Dimensions", desc: "Rate varies by dimension (e.g. model_type, fine_tuned)" },
];

export default function CostItemsPage() {
  const [selectedId, setSelectedId] = useState<string>(costItems[0].id);
  const [items, setItems] = useState<CostItem[]>(costItems);

  const selected = items.find((c) => c.id === selectedId)!;

  const updateRateModel = (model: RateModel) => {
    setItems((prev) => prev.map((c) => c.id === selectedId ? { ...c, rateModel: model } : c));
  };

  const addDimRow = () => {
    setItems((prev) => prev.map((c) => c.id === selectedId ? {
      ...c,
      dimensions: [...(c.dimensions ?? []), { model_type: "", fine_tuned: "false", rate_per_block: 0, block_size: 1000, free_units: 0 }],
    } : c));
  };

  const updateDimRow = (idx: number, patch: Partial<DimensionRow>) => {
    setItems((prev) => prev.map((c) => c.id === selectedId ? {
      ...c,
      dimensions: (c.dimensions ?? []).map((r, i) => i === idx ? { ...r, ...patch } : r),
    } : c));
  };

  const deleteDimRow = (idx: number) => {
    setItems((prev) => prev.map((c) => c.id === selectedId ? {
      ...c,
      dimensions: (c.dimensions ?? []).filter((_, i) => i !== idx),
    } : c));
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Cost Items</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Define what each meter costs you (cost of goods)</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left — cost item list */}
        <div className="md:w-56 flex-shrink-0">
          <div className="rounded-lg border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-3 py-2.5 border-b text-xs font-semibold tracking-wide uppercase"
              style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--bg)" }}>
              Cost Items
            </div>
            {items.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className="w-full text-left px-3 py-2.5 text-sm border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: c.id === selectedId ? "var(--accent-light)" : "var(--surface)",
                  color: c.id === selectedId ? "var(--accent)" : "var(--text)",
                  fontWeight: c.id === selectedId ? 500 : 400,
                }}>
                {c.meterLabel}
              </button>
            ))}
          </div>

          {/* Unattached meters */}
          {meters.filter((m) => !items.find((c) => c.meterId === m.id)).length > 0 && (
            <div className="mt-3 rounded-lg border p-3"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>No cost item yet</div>
              {meters.filter((m) => !items.find((c) => c.meterId === m.id) && m.status === "active").map((m) => (
                <div key={m.id} className="text-xs py-1" style={{ color: "var(--muted)" }}>• {m.label}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right — rate model editor */}
        <div className="flex-1 rounded-lg border p-4 md:p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-medium" style={{ color: "var(--text)" }}>{selected.meterLabel}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Meter: <code className="font-mono">{meters.find((m) => m.id === selected.meterId)?.apiName}</code>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ background: "var(--accent)" }}>
              Save
            </button>
          </div>

          {/* Rate model selector */}
          <div className="mb-5">
            <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Rate Model</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RATE_MODELS.map(({ value, label, desc }) => (
                <button key={value} onClick={() => updateRateModel(value)}
                  className="text-left p-3 rounded-lg border transition-colors"
                  style={selected.rateModel === value
                    ? { borderColor: "var(--accent)", background: "var(--accent-light)" }
                    : { borderColor: "var(--border)", background: "var(--bg)" }}>
                  <div className="text-xs font-semibold mb-0.5"
                    style={{ color: selected.rateModel === value ? "var(--accent)" : "var(--text)" }}>
                    {label}
                  </div>
                  <div className="text-[10px] leading-tight" style={{ color: "var(--muted)" }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Per unit */}
          {selected.rateModel === "per_unit" && (
            <div>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Rate</div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--muted)" }}>$</span>
                <input type="number" defaultValue={selected.unitRate ?? 0}
                  className="w-40 text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                <span className="text-sm" style={{ color: "var(--muted)" }}>per unit</span>
              </div>
            </div>
          )}

          {/* Per block */}
          {selected.rateModel === "per_block" && (
            <div className="flex gap-4 flex-wrap">
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Rate ($)</div>
                <input type="number" defaultValue={selected.blockRate ?? 0}
                  className="w-32 text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Block size</div>
                <input type="number" defaultValue={selected.blockSize ?? 1000}
                  className="w-32 text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
            </div>
          )}

          {/* Tiered */}
          {selected.rateModel === "tiered" && (
            <div>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Tiers</div>
              <div className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      {["Up to (units)", "Rate per unit ($)"].map((h) => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.tieredRates ?? []).map((tier, i) => (
                      <tr key={i} style={{ borderBottom: i < (selected.tieredRates?.length ?? 0) - 1 ? "1px solid var(--border)" : "none" }}>
                        <td className="px-4 py-2.5">
                          {tier.upTo === null
                            ? <span className="text-xs italic" style={{ color: "var(--muted)" }}>Unlimited</span>
                            : <span className="text-xs font-mono" style={{ color: "var(--text)" }}>{tier.upTo.toLocaleString()}</span>}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: tier.rate === 0 ? "var(--muted)" : "var(--text)" }}>
                          {tier.rate === 0 ? "Free" : `$${tier.rate.toFixed(6)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dimensions */}
          {selected.rateModel === "dimensions" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Rate Table</div>
                <div className="flex gap-2">
                  <button onClick={addDimRow}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border"
                    style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                    <Plus size={11} />+ Add row
                  </button>
                </div>
              </div>
              <div className="rounded-lg border overflow-x-auto"
                style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      {["model_type", "fine_tuned", "Rate / block ($)", "Block size", "Free units", ""].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.dimensions ?? []).map((row, i) => (
                      <tr key={i} style={{ borderBottom: i < (selected.dimensions?.length ?? 0) - 1 ? "1px solid var(--border)" : "none" }}>
                        {(["model_type", "fine_tuned"] as const).map((col) => (
                          <td key={col} className="px-3 py-2">
                            <input value={row[col]} onChange={(e) => updateDimRow(i, { [col]: e.target.value })}
                              className="w-24 text-xs px-2 py-1 rounded border outline-none"
                              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <input type="number" value={row.rate_per_block}
                            onChange={(e) => updateDimRow(i, { rate_per_block: parseFloat(e.target.value) })}
                            className="w-24 text-xs px-2 py-1 rounded border outline-none"
                            style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={row.block_size}
                            onChange={(e) => updateDimRow(i, { block_size: parseInt(e.target.value) })}
                            className="w-20 text-xs px-2 py-1 rounded border outline-none"
                            style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={row.free_units}
                            onChange={(e) => updateDimRow(i, { free_units: parseInt(e.target.value) })}
                            className="w-20 text-xs px-2 py-1 rounded border outline-none"
                            style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => deleteDimRow(i)}>
                            <Trash2 size={13} style={{ color: "#DC2626" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

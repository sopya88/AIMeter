"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle, Plus, X } from "lucide-react";
import { allAlerts } from "@/data/mock";

const severityStyle: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  warning: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
};

type NewAlert = { team: string; type: string; threshold: string; channels: string[] };
const defaultAlert: NewAlert = { team: "", type: "budget", threshold: "", channels: [] };

export default function Alerts() {
  const [alerts, setAlerts] = useState(allAlerts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAlert>(defaultAlert);

  const dismiss = (id: number) => setAlerts((a) => a.filter((x) => x.id !== id));

  const toggleChannel = (ch: string) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.team || !form.threshold) return;
    setAlerts((a) => [{
      id: Date.now(), type: form.type, team: form.team,
      message: `${form.type === "budget" ? `Budget threshold ${form.threshold}%` : `${form.type.replace("_", " ")} alert at ${form.threshold}%`}`,
      severity: "warning", created: new Date().toISOString().slice(0, 10),
    }, ...a]);
    setForm(defaultAlert);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Alerts</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Monitor budget, cost spikes & token anomalies</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Plus size={14} />
          <span className="hidden sm:inline">New Alert</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 md:p-5 mb-5"
          style={{ background: "var(--surface)", borderColor: "var(--accent)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Create New Alert</div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Stack 2 cols on mobile too but use grid on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Team</label>
                <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}
                  placeholder="e.g. Data Science"
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Alert Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                  <option value="budget">Budget %</option>
                  <option value="cost_spike">Cost Spike</option>
                  <option value="token_spike">Token Spike</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Threshold (%)</label>
                <input value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder="e.g. 80" type="number" min="1" max="100"
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Notify via</label>
                <div className="flex gap-2">
                  {["Email", "Slack", "WhatsApp"].map((ch) => (
                    <button type="button" key={ch} onClick={() => toggleChannel(ch)}
                      className="flex-1 py-2 rounded-md text-xs font-medium border transition-colors"
                      style={form.channels.includes(ch)
                        ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                        : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}>
                Create Alert
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted)" }}>
            <CheckCircle size={32} /><div className="text-sm">No active alerts</div>
          </div>
        )}
        {alerts.map((a) => {
          const s = severityStyle[a.severity];
          return (
            <div key={a.id} className="flex items-start gap-3 rounded-lg border p-4"
              style={{ background: s.bg, borderColor: s.border }}>
              <AlertTriangle size={15} style={{ color: s.text, marginTop: 1, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: s.text }}>{a.team}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-wide"
                    style={{ background: s.text + "18", color: s.text }}>{a.severity}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "white", color: "var(--muted)" }}>{a.type.replace("_", " ")}</span>
                </div>
                <div className="text-sm" style={{ color: "var(--text)" }}>{a.message}</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{a.created}</div>
              </div>
              <button onClick={() => dismiss(a.id)} className="p-1 rounded flex-shrink-0">
                <X size={14} style={{ color: "var(--muted)" }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

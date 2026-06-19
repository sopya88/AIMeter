"use client";
import { useState } from "react";
import { Bell, Plus, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { alerts as initAlerts, meters, type Alert, type AlertChannel, type AlertScope } from "@/data/mock";

const statusStyle = {
  enabled:  { bg: "#DCFCE7", text: "#16A34A" },
  disabled: { bg: "#F3F4F6", text: "#6B7280" },
};

const ChannelIcon = ({ ch }: { ch: AlertChannel }) => {
  if (ch === "slack")   return <span className="text-[11px] font-bold" style={{ color: "#4A154B" }}>S</span>;
  if (ch === "email")   return <Mail size={13} style={{ color: "#185FA5" }} />;
  if (ch === "webhook") return <span className="text-[11px] font-bold" style={{ color: "#D97706" }}>⚡</span>;
  return null;
};

const scopeLabel: Record<AlertScope, string> = {
  each_customer:     "Each customer",
  all_customers:     "All customers",
  specific_customer: "Specific customer",
};

const defaultForm = { name: "", alertOn: "usage", meter: "", rule: "", scope: "each_customer" as AlertScope, sendTo: [] as AlertChannel[] };

export default function AlertsPage() {
  const [rows, setRows]     = useState<Alert[]>(initAlerts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]     = useState(defaultForm);

  const toggle = (id: string) =>
    setRows((prev) => prev.map((a) => a.id === id
      ? { ...a, status: a.status === "enabled" ? "disabled" : "enabled" }
      : a));

  const toggleCh = (ch: AlertChannel) =>
    setForm((f) => ({
      ...f,
      sendTo: f.sendTo.includes(ch) ? f.sendTo.filter((c) => c !== ch) : [...f.sendTo, ch],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.meter || !form.rule) return;
    setRows((prev) => [{
      id: String(Date.now()), name: form.name, alertOn: form.alertOn,
      meter: form.meter, rule: form.rule, scope: form.scope,
      sendTo: form.sendTo, status: "enabled",
      modified: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    setForm(defaultForm);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Alerts</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Rules that watch meters and notify your team</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white flex-shrink-0"
          style={{ background: "var(--accent)" }}>
          <Plus size={14} /><span className="hidden sm:inline">Create alert</span><span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-lg border p-4 md:p-5 mb-5"
          style={{ background: "var(--surface)", borderColor: "var(--accent)" }}>
          <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>New Alert Rule</div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Alert name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. High token usage"
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Alert on</label>
                <select value={form.alertOn} onChange={(e) => setForm({ ...form, alertOn: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                  <option value="usage">Usage</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Meter</label>
                <select value={form.meter} onChange={(e) => setForm({ ...form, meter: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                  <option value="">Select meter…</option>
                  {meters.filter((m) => m.status === "active").map((m) => (
                    <option key={m.id} value={m.label}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Rule (e.g. &gt; 1000000)</label>
                <input value={form.rule} onChange={(e) => setForm({ ...form, rule: e.target.value })}
                  placeholder="> 1,000,000"
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Scope</label>
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as AlertScope })}
                  className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                  <option value="each_customer">Each customer</option>
                  <option value="all_customers">All customers</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Send to</label>
                <div className="flex gap-2">
                  {(["slack", "email", "webhook"] as AlertChannel[]).map((ch) => (
                    <button type="button" key={ch} onClick={() => toggleCh(ch)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs border font-medium transition-colors capitalize"
                      style={form.sendTo.includes(ch)
                        ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                        : { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" }}>
                      <ChannelIcon ch={ch} />
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
              <button type="submit"
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}>Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Alert table */}
      <div className="rounded-lg border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                {["Name", "Alert on", "Rule", "Scope", "Send to", "Status", "Modified", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium whitespace-nowrap"
                    style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => {
                const s = statusStyle[a.status];
                return (
                  <tr key={a.id}
                    style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Bell size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <span className="font-medium text-xs" style={{ color: "var(--text)" }}>{a.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs capitalize" style={{ color: "var(--text)" }}>{a.alertOn}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{a.meter}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: "var(--text)" }}>{a.rule}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>{scopeLabel[a.scope]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {a.sendTo.map((ch) => <ChannelIcon key={ch} ch={ch} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: s.bg, color: s.text }}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>{a.modified}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(a.id)} title="Toggle status">
                        {a.status === "enabled"
                          ? <ToggleRight size={20} style={{ color: "var(--accent)" }} />
                          : <ToggleLeft  size={20} style={{ color: "var(--muted)" }} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

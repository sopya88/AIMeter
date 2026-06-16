"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, Key, Save } from "lucide-react";
import { settings, PROVIDER_COLORS } from "@/data/mock";

export default function Settings() {
  const [form, setForm] = useState({
    company: settings.company,
    gstin: settings.gstin,
    pan: settings.pan,
    currency: settings.currency,
  });
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Company profile, billing & API keys</p>
      </div>

      {/* Company Settings */}
      <div className="rounded-lg border p-5 mb-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Company & Billing</div>
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Company Name</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-md border outline-none"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>GSTIN</label>
            <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-md border outline-none font-mono"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>PAN</label>
            <input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-md border outline-none font-mono"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Billing Currency</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-md border outline-none"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-3 justify-end">
            {saved && (
              <span className="flex items-center gap-1 text-sm" style={{ color: "#1D9E75" }}>
                <CheckCircle size={14} />Settings saved
              </span>
            )}
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}>
              <Save size={14} />Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* API Keys */}
      <div className="rounded-lg border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} style={{ color: "var(--muted)" }} />
          <div className="text-sm font-medium" style={{ color: "var(--text)" }}>Connected API Keys</div>
        </div>
        <div className="flex flex-col gap-3">
          {settings.apiKeys.map((k) => (
            <div key={k.provider} className="flex items-center justify-between p-3 rounded-lg border"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: PROVIDER_COLORS[k.provider as keyof typeof PROVIDER_COLORS] }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{k.provider}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{k.key}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {k.status === "connected"
                  ? <span className="flex items-center gap-1 text-xs" style={{ color: "#1D9E75" }}>
                      <CheckCircle size={13} />Connected
                    </span>
                  : <span className="flex items-center gap-1 text-xs" style={{ color: "#D97706" }}>
                      <AlertCircle size={13} />Check key
                    </span>
                }
                <button className="text-xs px-2.5 py-1 rounded border ml-2"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

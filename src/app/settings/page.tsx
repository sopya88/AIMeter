"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, Key, Save } from "lucide-react";

const apiKeys = [
  { provider: "OpenAI",    key: "sk-...a4f2", status: "connected", color: "#378ADD" },
  { provider: "Anthropic", key: "sk-ant-...8c3d", status: "connected", color: "#1D9E75" },
  { provider: "Google",    key: "AIza...9k2p", status: "connected", color: "#EF9F27" },
  { provider: "Cohere",    key: "co-...7R2T",  status: "warning",   color: "#D4537E" },
];

export default function Settings() {
  const [form, setForm] = useState({ company: "Acme Technologies Pvt. Ltd.", apiUrl: "https://ingest.aimeter.io" });
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: "var(--muted)" }}>Workspace configuration & API credentials</p>
      </div>

      <div className="rounded-lg border p-4 md:p-5 mb-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-sm font-medium mb-4" style={{ color: "var(--text)" }}>Workspace</div>
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Company name</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-md border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Ingest endpoint</label>
              <input value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-md border outline-none font-mono"
                style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            {saved && <span className="flex items-center gap-1 text-sm" style={{ color: "#1D9E75" }}><CheckCircle size={14} />Saved</span>}
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}><Save size={14} />Save</button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border p-4 md:p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Key size={15} style={{ color: "var(--muted)" }} />
          <div className="text-sm font-medium" style={{ color: "var(--text)" }}>LLM Provider API Keys</div>
        </div>
        <div className="flex flex-col gap-2.5">
          {apiKeys.map((k) => (
            <div key={k.provider} className="flex items-center justify-between p-3 rounded-lg border gap-3"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: k.color }} />
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{k.provider}</div>
                  <div className="text-xs font-mono truncate" style={{ color: "var(--muted)" }}>{k.key}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {k.status === "connected"
                  ? <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: "#1D9E75" }}><CheckCircle size={13} />Connected</span>
                  : <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: "#D97706" }}><AlertCircle size={13} />Check key</span>}
                <span className="sm:hidden">
                  {k.status === "connected" ? <CheckCircle size={15} color="#1D9E75" /> : <AlertCircle size={15} color="#D97706" />}
                </span>
                <button className="text-xs px-2.5 py-1 rounded border"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Update</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

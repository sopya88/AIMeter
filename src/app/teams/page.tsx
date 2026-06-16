"use client";
import { AlertTriangle, Users } from "lucide-react";
import { teams, PROVIDER_COLORS } from "@/data/mock";
import { formatINR } from "@/lib/utils";

export default function Teams() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Teams</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Budget utilisation & provider access per team</p>
      </div>

      <div className="flex flex-col gap-4">
        {teams.map((team) => {
          const pct = Math.round((team.spend / team.budget) * 100);
          const isNearLimit = pct >= 70;
          const isOver = pct >= 90;
          return (
            <div key={team.id} className="rounded-lg border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--accent-light)" }}>
                    <Users size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: "var(--text)" }}>{team.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {team.lead} · {team.members} members
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isNearLimit && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: isOver ? "#FEF2F2" : "#FFFBEB", color: isOver ? "#DC2626" : "#D97706" }}>
                      <AlertTriangle size={11} />
                      {isOver ? "Near limit" : "Watch"}
                    </span>
                  )}
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: "var(--text)" }}>{formatINR(team.spend)}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>of {formatINR(team.budget)}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, background: isOver ? "#DC2626" : isNearLimit ? "#D97706" : "var(--accent)" }} />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
                  <span>{pct}% used</span>
                  <span>{formatINR(team.budget - team.spend)} remaining</span>
                </div>
              </div>

              {/* Provider badges */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Access:</span>
                {team.providers.map((p) => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ background: PROVIDER_COLORS[p as keyof typeof PROVIDER_COLORS] + "18", color: PROVIDER_COLORS[p as keyof typeof PROVIDER_COLORS] }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

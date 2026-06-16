"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, BarChart2, Users, Bell, Settings, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: FileText },
  { label: "Usage", href: "/usage", icon: BarChart2 },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-shrink-0 h-screen sticky top-0 flex-col border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span className="font-semibold text-base tracking-tight" style={{ color: "var(--text)" }}>AIMeter</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  !active && "hover:bg-gray-50")}
                style={active ? { background: "var(--accent)", color: "#fff" } : { color: "var(--muted)" }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          <div className="font-medium" style={{ color: "var(--text)" }}>Acme Technologies</div>
          <div>GSTIN 27AABCU9603R1ZX</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 h-12 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <Zap size={12} color="#fff" fill="#fff" />
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>AIMeter</span>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={active ? { color: "var(--accent)" } : { color: "var(--muted)" }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

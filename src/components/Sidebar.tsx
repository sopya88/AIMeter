"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  Bell,
  Settings,
  Zap,
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
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "var(--accent)" }}>
          <Zap size={14} color="#fff" fill="#fff" />
        </div>
        <span className="font-semibold text-base tracking-tight" style={{ color: "var(--text)" }}>
          AIMeter
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "hover:bg-gray-50"
              )}
              style={active
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--muted)" }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <div className="font-medium" style={{ color: "var(--text)" }}>Acme Technologies</div>
        <div>GSTIN 27AABCU9603R1ZX</div>
      </div>
    </aside>
  );
}

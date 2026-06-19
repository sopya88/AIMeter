"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart2, DollarSign, TrendingUp, Activity,
  Users, Tag, GitBranch, Bell, FileText, Cpu, Plug, Settings,
  Zap, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ElementType; active?: boolean };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "HOME",
    items: [
      { label: "Dashboard",   href: "/",          icon: LayoutDashboard },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Usage",       href: "/usage",     icon: BarChart2,    active: false },
      { label: "Cost",        href: "/cost-items",icon: DollarSign },
      { label: "Revenue",     href: "/revenue",   icon: TrendingUp,   active: false },
      { label: "Meters",      href: "/meters",    icon: Activity },
      { label: "Customers",   href: "/customers", icon: Users },
      { label: "Pricing",     href: "/pricing",   icon: Tag },
      { label: "Commitments", href: "/commitments",icon: GitBranch,   active: false },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Alerts",       href: "/alerts",       icon: Bell },
      { label: "Logs",         href: "/logs",         icon: FileText,  active: false },
      { label: "Jobs",         href: "/jobs",         icon: Cpu,       active: false },
      { label: "Integrations", href: "/integrations", icon: Plug,      active: false },
      { label: "Settings",     href: "/settings",     icon: Settings,  active: false },
    ],
  },
];

// Routes that are built (vs greyed-out placeholders)
const BUILT = new Set(["/", "/usage", "/revenue", "/meters", "/cost-items", "/pricing", "/alerts", "/customers"]);

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-52 flex-shrink-0 h-screen sticky top-0 flex-col border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text)" }}>AIMeter</span>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-4 scrollbar-thin">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-1 text-[10px] font-semibold tracking-widest"
                style={{ color: "var(--muted)" }}>
                {section.title}
              </div>
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = path === href;
                const built = BUILT.has(href);
                return (
                  <Link
                    key={href}
                    href={built ? href : "#"}
                    onClick={(e) => !built && e.preventDefault()}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 rounded-md text-[13px] font-medium transition-colors",
                      active  ? "" : built ? "hover:bg-gray-50" : "opacity-40 cursor-default"
                    )}
                    style={active ? { background: "var(--accent)", color: "#fff" } : { color: "var(--muted)" }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={14} />
                      {label}
                    </span>
                    {!built && <ChevronRight size={11} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          <div className="font-medium text-[11px]" style={{ color: "var(--text)" }}>acme-ai-corp</div>
          <div className="text-[10px] mt-0.5">API key: sk-am-••••••••</div>
        </div>
      </aside>

      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 h-12 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <Zap size={11} color="#fff" fill="#fff" />
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>AIMeter</span>
      </div>

      {/* ── Mobile bottom nav (built screens only) ─────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {[
          { label: "Home",     href: "/",          icon: LayoutDashboard },
          { label: "Usage",    href: "/usage",     icon: BarChart2 },
          { label: "Revenue",  href: "/revenue",   icon: TrendingUp },
          { label: "Meters",   href: "/meters",    icon: Activity },
          { label: "Alerts",   href: "/alerts",    icon: Bell },
          { label: "Customers",href: "/customers", icon: Users },
        ].map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={active ? { color: "var(--accent)" } : { color: "var(--muted)" }}>
              <Icon size={17} />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

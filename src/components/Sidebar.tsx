"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart2, Bell,
  Zap, Bot, Shield, ClipboardList, Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ElementType };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "HOME",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Usage",  href: "/usage",  icon: BarChart2 },
      { label: "Alerts", href: "/alerts", icon: Bell },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { label: "Licenses",    href: "/licenses", icon: Shield },
      { label: "AI Agents",   href: "/agents",   icon: Bot },
      { label: "Audit & GST", href: "/audit",    icon: ClipboardList },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
];

const BUILT = new Set(["/", "/usage", "/alerts", "/licenses", "/agents", "/audit", "/integrations"]);

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
        <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight" style={{ color: "var(--text)" }}>AIMeter</div>
            <div className="text-[10px]" style={{ color: "var(--muted)" }}>AI Governance</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-5 scrollbar-thin">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-1 text-[10px] font-semibold tracking-widest"
                style={{ color: "var(--muted)" }}>
                {section.title}
              </div>
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = path === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-colors",
                      active ? "" : "hover:bg-orange-50"
                    )}
                    style={active
                      ? { background: "var(--accent)", color: "#fff" }
                      : { color: "var(--muted)" }}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 h-12 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <Zap size={11} color="#fff" fill="#fff" />
        </div>
        <span className="font-bold text-sm" style={{ color: "var(--text)" }}>AIMeter</span>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {[
          { label: "Home",     href: "/",         icon: LayoutDashboard },
          { label: "Usage",    href: "/usage",    icon: BarChart2 },
          { label: "Licenses", href: "/licenses", icon: Shield },
          { label: "Agents",   href: "/agents",   icon: Bot },
          { label: "Audit",    href: "/audit",    icon: ClipboardList },
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

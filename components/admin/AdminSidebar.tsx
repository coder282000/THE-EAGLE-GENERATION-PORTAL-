// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    section: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
      { name: "My Tasks", href: "/admin/tasks", icon: "✅", badge: 6 },
      { name: "Search", href: "/admin/search", icon: "🔍" },
    ],
  },
  {
    section: "People",
    items: [
      { name: "Applications", href: "/admin/applications", icon: "📋", badge: 34 },
      { name: "Members", href: "/admin/members", icon: "👥" },
      { name: "Chapters", href: "/admin/chapters", icon: "🏛️" },
    ],
  },
  {
    section: "Content",
    items: [
      { name: "Learning", href: "/admin/learning", icon: "📚" },
      { name: "Moderation", href: "/admin/moderation", icon: "🛡️", badge: 12 },
      { name: "Communications", href: "/admin/communications", icon: "📨" },
      { name: "Events", href: "/admin/events", icon: "🎪" },
    ],
  },
  {
    section: "Finance",
    items: [
      { name: "Commerce & Finance", href: "/admin/finance", icon: "💰" },
      { name: "Credit", href: "/admin/credit", icon: "🏦" },
      { name: "Savings", href: "/admin/savings", icon: "🔄" },
      { name: "Treasury & Custody", href: "/admin/treasury", icon: "🔐" },
      { name: "OTC Desk", href: "/admin/otc", icon: "📈" },
      { name: "Remittance", href: "/admin/remittance", icon: "🌍" },
    ],
  },
  {
    section: "Compliance",
    items: [
      { name: "Compliance", href: "/admin/compliance", icon: "⚖️", badge: 5 },
      { name: "Data Protection", href: "/admin/dataprotection", icon: "🔒" },
      { name: "Analytics", href: "/admin/analytics", icon: "📈" },
      { name: "Audit & Security", href: "/admin/audit", icon: "🔍" },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: "⚙️" },
      { name: "Support Desk", href: "/admin/support", icon: "🎧" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 w-64 h-full bg-white border-r border-ink/10 overflow-y-auto z-50 transition-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-ink/10">
          <h1 className="text-lg font-bold text-ink">Admin Console</h1>
          <p className="text-xs text-ink/60">Eagle Generation Portal</p>
        </div>

        <nav className="p-3 space-y-4">
          {navigation.map((section) => (
            <div key={section.section}>
              <p className="px-3 py-1 text-xs font-semibold text-ink/40 uppercase tracking-wider">
                {section.section}
              </p>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-sky/10 text-sky font-medium"
                          : "text-ink/70 hover:bg-paper hover:text-ink"
                      )}
                    >
                      <span className="text-base" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span
                          className={cn(
                            "text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                            isActive
                              ? "bg-sky text-white"
                              : "bg-clay/20 text-clay"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-sky text-white shadow-lg flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className="text-xl">{isOpen ? "✕" : "☰"}</span>
      </button>
    </>
  );
}
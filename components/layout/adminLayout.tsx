// components/layout/adminlayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

// ─── Navigation Config ───────────────────────────────────────────────
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

// ─── Breadcrumb Labels ──────────────────────────────────────────────
const breadcrumbLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  tasks: "My Tasks",
  search: "Search",
  applications: "Applications",
  members: "Members",
  chapters: "Chapters",
  learning: "Learning",
  moderation: "Moderation",
  communications: "Communications",
  events: "Events",
  finance: "Commerce & Finance",
  credit: "Credit",
  savings: "Savings",
  treasury: "Treasury & Custody",
  otc: "OTC Desk",
  remittance: "Remittance",
  compliance: "Compliance",
  dataprotection: "Data Protection",
  analytics: "Analytics",
  audit: "Audit & Security",
  settings: "System Settings",
  support: "Support Desk",
};

// ─── AdminLayout ────────────────────────────────────────────────────
interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ─── AdminSidebar (internal) ────────────────────────────────────────
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 w-64 h-full bg-white border-r border-ink/10 overflow-y-auto z-50 transition-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin navigation"
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
                      onClick={onClose}
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
    </>
  );
}

// ─── AdminHeader (internal) ─────────────────────────────────────────
interface AdminHeaderProps {
  onMenuClick: () => void;
}

function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-ink/10">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-paper text-ink"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-1.5 text-sm min-w-0 flex-1"
        >
          {segments.map((segment, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            const label =
              breadcrumbLabels[segment] ??
              segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <div key={href} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && (
                  <span className="text-ink/30 shrink-0" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="font-medium text-ink truncate">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-ink/60 hover:text-sky truncate"
                  >
                    {label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/search" aria-label="Search">
            <Button variant="ghost" size="sm">
              🔍
            </Button>
          </Link>
          <Button variant="ghost" size="sm" aria-label="Notifications">
            🔔
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-ink/10">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-ink leading-tight">
                Solomon A.
              </p>
              <p className="text-xs text-ink/50 leading-tight">
                Administrator
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-sky/15 flex items-center justify-center text-sky font-bold text-sm"
              aria-label="Solomon A., Administrator"
            >
              SA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
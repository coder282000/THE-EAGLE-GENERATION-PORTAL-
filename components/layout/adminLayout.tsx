// components/layout/adminlayout.tsx
"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { useCurrentUser } from "@/lib/mock/current-user";
import {
  mockApplications,
  mockAdminMyTasks,
  PENDING_APPLICATION_STATUSES,
} from "@/components/mock/data";

const SIDEBAR_COLLAPSED_KEY = "eagle.admin.sidebarCollapsed";

// ─── Navigation config ──────────────────────────────────────────────
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

function buildNavigation(): NavSection[] {
  const pendingApplications = mockApplications.filter((a) =>
    PENDING_APPLICATION_STATUSES.includes(a.status)
  ).length;

  const openTasks = mockAdminMyTasks.length;

  return [
    {
      section: "Overview",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { name: "My Tasks", href: "/admin/tasks", icon: "✅", badge: openTasks },
        { name: "Search", href: "/admin/search", icon: "🔍" },
      ],
    },
    {
      section: "People",
      items: [
        {
          name: "Applications",
          href: "/admin/applications",
          icon: "📋",
          badge: pendingApplications,
        },
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
}

// ─── Breadcrumb labels ──────────────────────────────────────────────
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hydrate collapsed state from localStorage after mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-[padding-left] duration-200 ease-in-out",
          collapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onOpenMobile={openMobile}
        />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <RoleSwitcher />
    </div>
  );
}

// ─── AdminSidebar (module-scope, memoised) ──────────────────────────
interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AdminSidebar = memo(function AdminSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const navigation = buildNavigation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/50 z-40"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-white border-r border-ink/10 z-50",
          "flex flex-col transition-[width,transform] duration-200 ease-in-out",
          "w-64",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div
          className={cn(
            "h-14 flex items-center border-b border-ink/10 shrink-0",
            collapsed ? "lg:justify-center lg:px-0 px-4" : "px-4"
          )}
        >
          {collapsed && (
            <Link
              href="/admin/dashboard"
              title="Eagle Generation"
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-sky/10 text-sky font-bold text-xs"
            >
              EG
            </Link>
          )}
          <div className={cn("min-w-0", collapsed && "lg:hidden")}>
            <h1 className="text-base font-bold text-ink truncate">
              Admin Console
            </h1>
            <p className="text-xs text-ink/60 truncate">Eagle Generation</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navigation.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="px-3 py-1 text-xs font-semibold text-ink/40 uppercase tracking-wider">
                  {section.section}
                </p>
              )}
              {collapsed && (
                <div className="hidden lg:block h-px bg-ink/10 my-2" />
              )}
              <div className={cn("space-y-0.5", !collapsed && "mt-1")}>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "relative flex items-center rounded-lg text-sm transition-colors",
                        collapsed
                          ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2 gap-2.5"
                          : "px-3 py-2 gap-2.5",
                        isActive
                          ? "bg-sky/10 text-sky font-medium"
                          : "text-ink/70 hover:bg-paper hover:text-ink"
                      )}
                    >
                      <span className="text-base shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span
                        className={cn(
                          "flex-1 truncate",
                          collapsed && "lg:hidden"
                        )}
                      >
                        {item.name}
                      </span>
                      {item.badge != null && item.badge > 0 && !collapsed && (
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
                      {/* Collapsed badge dot (desktop only) */}
                      {item.badge != null && item.badge > 0 && collapsed && (
                        <span className="hidden lg:block absolute top-1.5 right-3 w-2 h-2 rounded-full bg-clay" />
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
});

// ─── AdminHeader (module-scope) ─────────────────────────────────────
interface AdminHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

function AdminHeader({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-ink/10">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3">
        {/* Left controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mobile: hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-paper text-ink"
            onClick={onOpenMobile}
            aria-label="Open navigation menu"
          >
            <span className="text-xl">☰</span>
          </button>

          {/* Desktop: collapse toggle */}
          <button
            className="hidden lg:flex p-2 rounded-lg hover:bg-paper text-ink/60 hover:text-ink transition-colors"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-lg leading-none">
              {collapsed ? "»" : "«"}
            </span>
          </button>
        </div>

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

        {/* Right controls */}
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
                {user.name}
              </p>
              <p className="text-xs text-ink/50 leading-tight">
                {user.role.replace(/_/g, " ")}
                {user.chapterCode ? ` · ${user.chapterCode}` : ""}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-sky/15 flex items-center justify-center text-sky font-bold text-sm"
              aria-label={`${user.name}, ${user.role}`}
            >
              {user.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
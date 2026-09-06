"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";

interface AdminNavItem {
  href: string;
  label: string;
}

const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/chapters", label: "Chapters" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings/roles", label: "Roles" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-ink-900 text-white h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 border-b border-ink-700">
          <Wordmark dark />
          <p className="text-ink-300 text-xs mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-ink-700 text-white"
                  : "text-ink-300 hover:bg-ink-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-700 text-ink-400 text-xs">
          v0.1.0 · Mockup
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-ink-100 h-14 flex items-center px-6 sticky top-0 z-10">
          <h2 className="font-display font-semibold text-ink-900 text-sm sm:text-base">
            {adminNavItems.find((item) => item.href === pathname || pathname.startsWith(item.href + "/"))?.label || "Admin"}
          </h2>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-ink-400">Admin</span>
            <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-medium">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

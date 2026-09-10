// components/admin/AdminHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/button";

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

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-ink/10">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm min-w-0"
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

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/search">
            <Button variant="ghost" size="sm" aria-label="Search">
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
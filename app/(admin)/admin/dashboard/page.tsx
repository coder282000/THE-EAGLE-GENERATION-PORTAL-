// app/admin/dashboard/page.tsx
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatCard } from "@/components/admin/StatCard";
import { QueueWidget } from "@/components/admin/QueueWidget";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/button";
import {
  mockAdminStats,
  mockQueueDepths,
  mockAdminRecentActivity,
} from "@/components/mock/data";

export const metadata = {
  title: "Admin Dashboard — Eagle Generation Portal",
};

const categoryColors: Record<string, string> = {
  member: "bg-sky/10 text-sky",
  finance: "bg-emerald-100 text-emerald-700",
  compliance: "bg-rose-100 text-rose-700",
  content: "bg-clay/20 text-clay",
};

const systemStatus = [
  { label: "API", status: "active" as const, value: "Operational" },
  { label: "Database", status: "active" as const, value: "Operational" },
  { label: "Payments", status: "active" as const, value: "Operational" },
  { label: "AML Screening", status: "active" as const, value: "Operational" },
  { label: "Kill Switch", status: "active" as const, value: "Deactivated" },
];

const quickActions = [
  { label: "Review applications", href: "/admin/applications", icon: "📋" },
  { label: "Approve refunds", href: "/admin/finance/refunds", icon: "💸" },
  { label: "KYC verification", href: "/admin/compliance/kyc", icon: "🪪" },
  { label: "Moderation queue", href: "/admin/moderation", icon: "🛡️" },
  { label: "AML alerts", href: "/admin/compliance/aml", icon: "🚨" },
];

export default function AdminDashboardPage() {
  const criticalQueues = mockQueueDepths.filter((q) => q.priority === "critical");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-ink/60 mt-1">
            Organisation-wide overview ·{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/tasks">
            <Button variant="outline" size="sm">
              ✅ My Tasks (6)
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="primary" size="sm">
              📈 Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalQueues.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200"
        >
          <span className="text-xl shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-rose-800">
              {criticalQueues.length} critical queue
              {criticalQueues.length > 1 ? "s" : ""} require attention
            </p>
            <p className="text-sm text-rose-700 mt-0.5">
              {criticalQueues.map((q) => q.label).join(" · ")}
            </p>
          </div>
          <Link
            href={criticalQueues[0].href}
            className="text-sm font-medium text-rose-800 hover:underline shrink-0"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAdminStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queues + Activity */}
        <div className="lg:col-span-2 space-y-6">
          <AdminCard
            title="Action Queues"
            subtitle="Items requiring your review"
            icon="📥"
            padding="sm"
            actions={
              <Link href="/admin/tasks">
                <Button variant="ghost" size="sm">
                  View all →
                </Button>
              </Link>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mockQueueDepths.map((queue) => (
                <QueueWidget key={queue.id} queue={queue} />
              ))}
            </div>
          </AdminCard>

          <AdminCard
            title="Recent Activity"
            subtitle="Latest actions across the platform"
            icon="🕐"
            padding="sm"
          >
            <div className="divide-y divide-ink/5">
              {mockAdminRecentActivity.map((item) => (
                <div
                  key={item.id}
                  className="py-3 px-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          categoryColors[item.category] ?? "bg-ink/10 text-ink/60"
                        }`}
                      >
                        {item.category}
                      </span>
                      <p className="text-sm font-medium text-ink">
                        {item.action}
                      </p>
                    </div>
                    <p className="text-sm text-ink/60 mt-1 truncate">
                      {item.target}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-ink/70">{item.actor}</p>
                    <p className="text-xs text-ink/40">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <AdminCard title="Quick Actions" icon="⚡" padding="sm">
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink/70 hover:bg-paper hover:text-ink transition-colors"
                >
                  <span aria-hidden="true">{action.icon}</span>
                  <span>{action.label}</span>
                  <span className="ml-auto text-ink/30" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="System Status" icon="🟢" padding="sm">
            <div className="space-y-3">
              {systemStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-ink/70">{item.label}</span>
                  <StatusBadge status={item.status}>
                    {item.value}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
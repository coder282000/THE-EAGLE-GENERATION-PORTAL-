"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { mockApplications, mockMembers, mockChapters, mockAuditLogs } from "@/components/mock/data";

export default function AdminDashboardPage() {
  // Calculate stats
  const totalMembers = mockMembers.length;
  const totalChapters = mockChapters.length;
  const pendingApplications = mockApplications.filter(
    (a) => a.status === "pending"
  ).length;
  const activeMembers = mockMembers.filter((m) => m.status === "active").length;
  const approvedApplications = mockApplications.filter(
    (a) => a.status === "approved"
  ).length;

  // Stats cards
  const stats = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: "👥",
      bg: "bg-sky-50",
      text: "text-sky-600",
    },
    {
      label: "Pending Applications",
      value: pendingApplications,
      icon: "📋",
      bg: "bg-dawn-50",
      text: "text-dawn-600",
    },
    {
      label: "Active Chapters",
      value: totalChapters,
      icon: "🏛️",
      bg: "bg-ink-50",
      text: "text-ink-600",
    },
    {
      label: "Approved Members",
      value: approvedApplications,
      icon: "✅",
      bg: "bg-green-50",
      text: "text-green-600",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      href: "/admin/applications",
      icon: "📋",
      label: "Review Applications",
      count: pendingApplications,
    },
    {
      href: "/admin/members",
      icon: "👤",
      label: "Manage Members",
      count: totalMembers,
    },
    {
      href: "/admin/chapters",
      icon: "🏛️",
      label: "Manage Chapters",
      count: totalChapters,
    },
    {
      href: "/admin/announcements",
      icon: "📢",
      label: "Manage Announcements",
      count: 8,
    },
    {
      href: "/admin/announcements/new",
      icon: "✏️",
      label: "Post Announcement",
    },
    // NEW: Certificates quick action
    {
      href: "/admin/learning/certificates",
      icon: "🎓",
      label: "Manage Certificates",
    },
  ];

  // Recent applications (latest 4)
  const recentApplications = useMemo(() => {
    return [...mockApplications]
      .sort((a, b) => b.reference.localeCompare(a.reference))
      .slice(0, 4);
  }, []);

  // Platform activity from audit logs
  const activities = useMemo(() => {
    return mockAuditLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map((log) => {
        const typeMap: Record<string, string> = {
          APPROVED_APPLICATION: "application",
          UPDATED_PROFILE: "profile",
          CREATED_ANNOUNCEMENT: "announcement",
          ADDED_MEMBER: "member",
          VIEWED_APPLICATION: "view",
          UPDATED_CHAPTER: "chapter",
        };
        return {
          id: log.id,
          action: log.action.replace(/_/g, " ").toLowerCase(),
          user: log.actor,
          time: new Date(log.timestamp).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: typeMap[log.action] || "activity",
        };
      });
  }, []);

  // Weekly activity data for chart
  const weekData = [
    { day: "Mon", applications: 4, members: 2 },
    { day: "Tue", applications: 7, members: 3 },
    { day: "Wed", applications: 3, members: 5 },
    { day: "Thu", applications: 9, members: 4 },
    { day: "Fri", applications: 5, members: 6 },
    { day: "Sat", applications: 2, members: 1 },
    { day: "Sun", applications: 1, members: 0 },
  ];
  const maxValue = Math.max(...weekData.map((d) => Math.max(d.applications, d.members)));

  // Status badge component
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-dawn-50 text-dawn-700",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-clay-50 text-clay-700",
    };
    return styles[status] || "bg-ink-50 text-ink-600";
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Admin Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Overview of the Eagle Generation platform.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 text-center">
              <div
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${stat.bg}`}
              >
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-ink-900">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-400">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="font-display text-sm font-semibold text-ink-900">
            Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center rounded-lg border border-ink-100 p-4 text-center transition-all hover:border-ink-300 hover:bg-ink-50"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="mt-1.5 text-sm font-medium text-ink-700">
                  {action.label}
                </span>
                {action.count !== undefined && (
                  <span className="mt-0.5 text-xs text-ink-400">
                    {action.count} items
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Card>

        {/* Two-column layout: Recent applications + Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-ink-900">
                Recent Applications
              </h2>
              <Link
                href="/admin/applications"
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-ink-50">
              {recentApplications.map((app) => (
                <li
                  key={app.reference}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">{app.name}</p>
                    <p className="text-xs text-ink-400">
                      {app.tier} · {app.chapter} · {app.reference}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </li>
              ))}
              {recentApplications.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-400">
                  No applications to review.
                </p>
              )}
            </ul>
          </Card>

          {/* Platform Activity */}
          <Card>
            <h2 className="font-display text-sm font-semibold text-ink-900">
              Platform Activity
            </h2>
            <ul className="mt-4 space-y-4 border-l border-ink-100 pl-4">
              {activities.map((activity) => (
                <li key={activity.id} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-4 ring-white ${
                      activity.type === "application"
                        ? "bg-dawn-400"
                        : activity.type === "announcement" || activity.type === "member"
                        ? "bg-sky-400"
                        : activity.type === "chapter"
                        ? "bg-ink-400"
                        : "bg-green-400"
                    }`}
                  />
                  <p className="text-sm leading-snug text-ink-700">
                    <span className="font-medium capitalize">
                      {activity.action}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    {activity.user} · {activity.time}
                  </p>
                </li>
              ))}
              {activities.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-400">
                  No recent activity.
                </p>
              )}
            </ul>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink-900">
              Weekly Activity
            </h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-dawn-400" />
                Applications
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />
                New Members
              </span>
            </div>
          </div>
          <div className="mt-6 flex h-40 items-end justify-between gap-2">
            {weekData.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-dawn-400 transition-all duration-500"
                    style={{
                      height: `${(day.applications / maxValue) * 100}%`,
                      minHeight: "4px",
                      maxHeight: "80%",
                    }}
                  />
                  <div
                    className="w-full rounded-sm bg-sky-400 transition-all duration-500"
                    style={{
                      height: `${(day.members / maxValue) * 60}%`,
                      minHeight: "4px",
                      maxHeight: "60%",
                    }}
                  />
                </div>
                <span className="text-xs text-ink-400">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
"use client";

import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { mockMembers } from "@/components/mock/data";

export default function DashboardPage() {
  const member = mockMembers[0];

  const stats = [
    { label: "My Chapter", value: member.chapter, icon: "🏛️" },
    { label: "Tier", value: member.tier, icon: "🎯" },
    { label: "Member ID", value: member.memberNumber, icon: "🆔" },
  ];

  const quickActions = [
    { href: "/chapter", icon: "🏛️", label: "View Chapter" },
    { href: "/learning/courses", icon: "📚", label: "Browse Courses" },  // ✅ now works
    { href: "/community/directory", icon: "👥", label: "Member Directory" },
    { href: "/events", icon: "📅", label: "Upcoming Events" }, // ⚠️ still 404 – create or remove
    { href: "/learning/certificates", icon: "🎓", label: "My Certificates" },
  ];

  const activities = [
    { id: 1, type: "enrollment", message: "You enrolled in 'Marketplace Ethics 101'", time: "2 days ago" },
    { id: 2, type: "event", message: "Chapter meeting tomorrow at 5 PM", time: "1 day ago" },
    { id: 3, type: "certificate", message: "You completed 'Foundations of Leadership'", time: "3 days ago" },
  ];

  const pillars = [
    { label: "Marketplace", percent: 65, barClass: "bg-dawn-400" },
    { label: "Governance", percent: 30, barClass: "bg-sky-400" },
    { label: "Technology", percent: 80, barClass: "bg-ink-400" },
  ];

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Welcome back, {member.firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Here&apos;s what&apos;s happening in your chapter and across the Eagle Generation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <p className="text-2xl">{stat.icon}</p>
              <p className="mt-1 font-display text-sm font-semibold text-ink-900">
                {stat.value}
              </p>
              <p className="text-[11px] text-ink-400">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Quick Actions
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded-md border border-ink-100 px-3 py-2 text-sm text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
              >
                <span>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Recent Activity
          </h3>
          <ul className="mt-3 space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dawn-400" />
                <div className="flex-1">
                  <p className="text-sm text-ink-700">{activity.message}</p>
                  <p className="text-xs text-ink-400">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/activity"
            className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline"
          >
            View all activity →
          </Link>
        </Card>

        <Card>
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Your Pillar Progress
          </h3>
          <div className="mt-3 space-y-2">
            {pillars.map((pillar) => (
              <div key={pillar.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">{pillar.label}</span>
                  <span className="text-ink-400">{pillar.percent}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-ink-100">
                  <div
                    className={`h-2 rounded-full ${pillar.barClass}`}
                    style={{ width: `${pillar.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
'use client';
"use client";

import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { mockAuditLogs } from "@/components/mock/data";

// Action labels and icons
const actionMap: Record<string, { label: string; icon: string; color: string }> = {
  APPROVED_APPLICATION: { label: "Approved Application", icon: "✅", color: "text-green-700" },
  UPDATED_PROFILE: { label: "Updated Profile", icon: "📝", color: "text-sky-700" },
  CREATED_ANNOUNCEMENT: { label: "Created Announcement", icon: "📢", color: "text-dawn-700" },
  ADDED_MEMBER: { label: "Added Member", icon: "👤", color: "text-indigo-700" },
  VIEWED_APPLICATION: { label: "Viewed Application", icon: "👁️", color: "text-gray-700" },
  UPDATED_CHAPTER: { label: "Updated Chapter", icon: "🏛️", color: "text-purple-700" },
};

export default function ActivityPage() {
  // Sort by timestamp descending (newest first)
  const sortedLogs = [...mockAuditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Activity Feed
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            All recent activities across the platform.
          </p>
        </div>

        <div className="space-y-3">
          {sortedLogs.map((log) => {
            const actionInfo = actionMap[log.action] || { label: log.action, icon: "📋", color: "text-gray-700" };
            return (
              <Card key={log.id} className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-lg">
                  {actionInfo.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink-700">
                    <span className="font-medium">{log.actor}</span>{" "}
                    <span className={actionInfo.color}>{actionInfo.label}</span>{" "}
                    <span className="font-medium">"{log.entity}"</span>
                  </p>
                  {log.details && (
                    <p className="text-xs text-ink-400 mt-0.5">{log.details}</p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">
                    {new Date(log.timestamp).toLocaleString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MemberLayout>
  );
}

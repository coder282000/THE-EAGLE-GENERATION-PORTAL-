"use client";

import { useState, useMemo } from "react";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockNotifications } from "@/components/mock/data";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Filter notifications for the current user (Grace – userId: '1')
  const userNotifications = useMemo(() => {
    return notifications.filter((n) => n.userId === "1");
  }, [notifications]);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    userNotifications.forEach((notif) => {
      const date = new Date(notif.createdAt);
      const today = new Date();
      let key = "";
      
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
          key = "Yesterday";
        } else {
          key = date.toLocaleDateString("en-KE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(notif);
    });
    
    // Sort each group by newest first
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    
    return groups;
  }, [userNotifications]);

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setIsMarkingAll(true);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setIsMarkingAll(false);
    }, 400);
  };

  // Format timestamp
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {unreadCount === 0
                ? "You're all caught up! 🎉"
                : `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={markAllAsRead}
              disabled={isMarkingAll}
              className="gap-1.5"
            >
              {isMarkingAll ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
                  Marking...
                </>
              ) : (
                <>✓ Mark all read</>
              )}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {userNotifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="font-display text-lg font-semibold text-ink-900">
              No notifications yet
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              We'll notify you when there's something important.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([groupDate, groupItems]) => (
              <div key={groupDate}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  {groupDate}
                </h2>
                <div className="space-y-2">
                  {groupItems.map((notification) => {
                    const isUnread = !notification.read;
                    return (
                      <Card
                        key={notification.id}
                        className={`p-4 transition-all ${
                          isUnread
                            ? "border-l-4 border-l-dawn-400 bg-white"
                            : "opacity-70 hover:opacity-90"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-ink-900">
                                  {notification.title}
                                  {isUnread && (
                                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-dawn-400" />
                                  )}
                                </p>
                              </div>
                              <span className="shrink-0 text-xs text-ink-400">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline"
                              >
                                View details →
                              </a>
                            )}
                          </div>
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700 transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
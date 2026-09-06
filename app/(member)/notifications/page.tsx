"use client";

import { useState, useEffect, useMemo } from "react";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { NotificationItem } from "@/components/notification/notificationitem";
import { mockNotifications, type Notification } from "@/components/mock/data";

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "read":
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        // Check if within the last 7 days
        const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo <= 7) {
          groupKey = "This Week";
        } else if (daysAgo <= 30) {
          groupKey = "This Month";
        } else {
          groupKey = "Older";
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const read = notifications.filter((n) => n.read).length;
    return { total, unread, read };
  }, [notifications]);

  // Mark a single notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark a single notification as unread
  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setIsMarkingAll(true);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setIsMarkingAll(false);
    }, 400);
  };

  // Filter tabs
  const tabs: { label: string; value: FilterType }[] = [
    { label: `All (${counts.total})`, value: "all" },
    { label: `Unread (${counts.unread})`, value: "unread" },
    { label: `Read (${counts.read})`, value: "read" },
  ];

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">
              Notifications
            </h1>
            <p className="text-ink-500 mt-1">
              Stay updated with the latest activity
            </p>
          </div>
          {notifications.length > 0 && counts.unread > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-ink-100 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                filter === tab.value
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200"
              }`}
              aria-current={filter === tab.value ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4" aria-live="polite">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-ink-100 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-200 flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-ink-200 rounded w-3/4" />
                    <div className="h-3 bg-ink-100 rounded w-full" />
                    <div className="h-3 bg-ink-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-ink-500 text-lg">
              {filter === "all" && "No notifications yet."}
              {filter === "unread" && "All caught up! No unread notifications."}
              {filter === "read" && "No read notifications."}
            </p>
            <p className="text-sm text-ink-400 mt-2">
              {filter === "all" && "When you receive notifications, they'll appear here."}
              {filter === "unread" && "New notifications will appear here when you receive them."}
              {filter === "read" && "As you read notifications, they'll appear here."}
            </p>
          </div>
        )}

        {/* Populated State */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([group, items]) => (
              <div key={group}>
                <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">
                  {group}
                </h2>
                <div className="space-y-2">
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { mockAnnouncements, type Announcement } from "@/components/mock/data";

// Assume current user is Grace (id: '1')
const CURRENT_USER_ID = "1";

type PriorityFilter = "all" | "HIGH" | "MEDIUM" | "LOW";

export default function AnnouncementsInboxPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<PriorityFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncements(mockAnnouncements);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter announcements by priority
  const filteredAnnouncements = useMemo(() => {
    if (filter === "all") return announcements;
    return announcements.filter((a) => a.priority === filter);
  }, [announcements, filter]);

  // Sort by date (newest first)
  const sortedAnnouncements = useMemo(() => {
    return [...filteredAnnouncements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredAnnouncements]);

  // Counts
  const counts = useMemo(() => {
    const total = announcements.length;
    const unread = announcements.filter(
      (a) => !(a.readBy?.includes(CURRENT_USER_ID))
    ).length;
    const read = total - unread;
    return { total, unread, read };
  }, [announcements]);

  // Check if an announcement is read by current user
  const isRead = (announcement: Announcement) => {
    return announcement.readBy?.includes(CURRENT_USER_ID) || false;
  };

  // Mark a single announcement as read
  const handleMarkAsRead = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id && !a.readBy?.includes(CURRENT_USER_ID)) {
          return {
            ...a,
            readBy: [...(a.readBy || []), CURRENT_USER_ID],
          };
        }
        return a;
      })
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setIsMarkingAll(true);
    setTimeout(() => {
      setAnnouncements((prev) =>
        prev.map((a) => {
          if (!a.readBy?.includes(CURRENT_USER_ID)) {
            return {
              ...a,
              readBy: [...(a.readBy || []), CURRENT_USER_ID],
            };
          }
          return a;
        })
      );
      setIsMarkingAll(false);
    }, 400);
  };

  // Priority badge colors
  const priorityColors: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
    HIGH: "bg-clay-100 text-clay-700 border-clay-200",
    MEDIUM: "bg-sky-100 text-sky-700 border-sky-200",
    LOW: "bg-ink-100 text-ink-600 border-ink-200",
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">
              Announcements
            </h1>
            <p className="text-ink-500 mt-1">
              Stay informed with the latest updates from Eagle Generation
            </p>
          </div>
          {announcements.length > 0 && counts.unread > 0 && (
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
          {[
            { label: `All (${counts.total})`, value: "all" },
            { label: `High (${announcements.filter(a => a.priority === 'HIGH').length})`, value: "HIGH" },
            { label: `Medium (${announcements.filter(a => a.priority === 'MEDIUM').length})`, value: "MEDIUM" },
            { label: `Low (${announcements.filter(a => a.priority === 'LOW').length})`, value: "LOW" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as PriorityFilter)}
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
        {!isLoading && sortedAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📢</div>
            <p className="text-ink-500 text-lg">
              {filter === "all" && "No announcements yet."}
              {filter !== "all" && `No ${filter.toLowerCase()} priority announcements.`}
            </p>
            <p className="text-sm text-ink-400 mt-2">
              {filter === "all" && "Check back later for updates from the team."}
              {filter !== "all" && "Try changing the filter to see other announcements."}
            </p>
          </div>
        )}

        {/* Populated State */}
        {!isLoading && sortedAnnouncements.length > 0 && (
          <div className="space-y-3">
            {sortedAnnouncements.map((announcement) => {
              const read = isRead(announcement);
              return (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block"
                >
                  <div
                    className={`p-4 border rounded-lg transition hover:shadow-md ${
                      read
                        ? "border-ink-100 bg-white hover:border-ink-200"
                        : "border-dawn-200 bg-dawn-50 hover:border-dawn-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      {!read && (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2
                            className={`text-sm font-medium ${
                              read ? "text-ink-700" : "text-ink-900"
                            }`}
                          >
                            {announcement.title}
                          </h2>
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${priorityColors[announcement.priority]}`}
                          >
                            {announcement.priority}
                          </span>
                        </div>
                        <p
                          className={`text-sm line-clamp-2 ${
                            read ? "text-ink-500" : "text-ink-700"
                          }`}
                        >
                          {announcement.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-ink-400">
                          <span>{announcement.author}</span>
                          <span>•</span>
                          <span>{formatDate(announcement.createdAt)}</span>
                          {!read && (
                            <>
                              <span>•</span>
                              <span className="text-sky-600 font-medium">Unread</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigation
                          e.stopPropagation();
                          handleMarkAsRead(announcement.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {read ? "✓ Read" : "Mark read"}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
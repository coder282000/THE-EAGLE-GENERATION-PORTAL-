"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { mockAnnouncements, type Announcement } from "@/components/mock/data";

const CURRENT_USER_ID = "1";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load and mark as read
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = mockAnnouncements.find((a) => a.id === id);
      if (found) {
        setAnnouncement(found);
        // Mark as read if not already
        if (!found.readBy?.includes(CURRENT_USER_ID)) {
          found.readBy = [...(found.readBy || []), CURRENT_USER_ID];
        }
      } else {
        setError("Announcement not found");
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  // Priority badge colors
  const priorityColors: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
    HIGH: "bg-clay-100 text-clay-700 border-clay-200",
    MEDIUM: "bg-sky-100 text-sky-700 border-sky-200",
    LOW: "bg-ink-100 text-ink-600 border-ink-200",
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="container-portal py-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-ink-200 rounded w-1/4" />
            <div className="h-10 bg-ink-200 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-ink-100 rounded w-full" />
              <div className="h-4 bg-ink-100 rounded w-full" />
              <div className="h-4 bg-ink-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !announcement) {
    return (
      <MemberLayout>
        <div className="container-portal py-6 max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            {error || "Announcement not found"}
          </h2>
          <Link href="/announcements">
            <Button variant="primary">Back to Announcements</Button>
          </Link>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/announcements"
          className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium mb-4"
        >
          ← Back to Announcements
        </Link>

        {/* Content */}
        <div className="bg-white border border-ink-100 rounded-lg p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`text-xs px-3 py-1 rounded-full border font-medium ${priorityColors[announcement.priority]}`}
            >
              {announcement.priority}
            </span>
            <span className="text-sm text-ink-400">
              {formatDate(announcement.createdAt)}
            </span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900 mb-2">
            {announcement.title}
          </h1>

          <p className="text-ink-500 text-sm mb-6">
            By {announcement.author}
          </p>

          <div className="prose prose-ink max-w-none">
            <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>

          {/* Footer actions */}
          <div className="mt-8 pt-6 border-t border-ink-100 flex flex-wrap gap-3 justify-between items-center">
            <p className="text-xs text-ink-400">
              {announcement.readBy?.includes(CURRENT_USER_ID)
                ? "✓ You have read this announcement"
                : "Marked as read"}
            </p>
            <Link href="/announcements">
              <Button variant="secondary" size="sm">
                View All Announcements
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}

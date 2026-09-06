'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  ArrowRight,
  Filter,
  X
} from "lucide-react";
import { mockMeetings, Meeting } from "@/components/mock/data";
import { format, isFuture, isPast } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  UPCOMING: { label: "Upcoming", color: "bg-blue-100 text-blue-700", icon: "📅" },
  LIVE: { label: "Live", color: "bg-green-100 text-green-700", icon: "🔴" },
  ENDED: { label: "Ended", color: "bg-ink-100 text-ink-600", icon: "✅" },
  CANCELLED: { label: "Cancelled", color: "bg-clay-100 text-clay-700", icon: "❌" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "All Members",
  CHAPTER: "Chapter Only",
  COHORT: "Cohort Only",
  MENTORSHIP: "Mentorship",
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "EEEE, MMMM d, yyyy");
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "h:mm a");
}

function getMeetingStatus(meeting: Meeting): "UPCOMING" | "LIVE" | "ENDED" | "CANCELLED" {
  if (meeting.status === "CANCELLED") return "CANCELLED";
  if (meeting.status === "LIVE") return "LIVE";
  if (meeting.status === "ENDED") return "ENDED";
  const now = new Date();
  const meetingTime = new Date(meeting.scheduledFor);
  const endTime = new Date(meetingTime.getTime() + meeting.durationMinutes * 60 * 1000);
  if (isFuture(meetingTime)) return "UPCOMING";
  if (now >= meetingTime && now < endTime) return "LIVE";
  return "ENDED";
}

// ============================================================
// Meeting Card Component
// ============================================================

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const status = getMeetingStatus(meeting);
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.UPCOMING;
  const isJoinable = status === "UPCOMING" || status === "LIVE";
  const formattedDate = formatDate(meeting.scheduledFor);
  const formattedTime = formatTime(meeting.scheduledFor);
  const audienceLabel = AUDIENCE_LABELS[meeting.audience] || meeting.audience;

  return (
    <Card className="border border-ink-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date badge */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-center gap-2 sm:gap-0 bg-ink-50 rounded-lg p-3 sm:p-4 min-w-[70px]">
          <span className="text-2xl font-bold text-ink-900">
            {format(new Date(meeting.scheduledFor), "dd")}
          </span>
          <span className="text-xs text-ink-400 uppercase">
            {format(new Date(meeting.scheduledFor), "MMM")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/meetings/${meeting.id}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {meeting.title}
              </h3>
            </Link>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
              <span>{statusInfo.icon}</span> {statusInfo.label}
            </span>
          </div>

          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{meeting.description}</p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formattedTime}
            </span>
            <span>•</span>
            <span>{meeting.durationMinutes} min</span>
            {meeting.isRecurring && (
              <>
                <span>•</span>
                <span className="text-ink-400">🔄 Recurring</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-medium bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">
              {audienceLabel}
            </span>
            {meeting.recordingUrl && (
              <span className="text-[10px] font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                📹 Recording Available
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          {isJoinable && meeting.meetingLink && (
            <Button 
              variant="primary" 
              size="sm" 
              className="gap-1"
              onClick={() => window.open(meeting.meetingLink, "_blank")}
            >
              <Video className="h-3.5 w-3.5" /> Join
            </Button>
          )}
          <Link href={`/meetings/${meeting.id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function MeetingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "UPCOMING" | "LIVE" | "ENDED" | "CANCELLED">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMeetings(mockMeetings);
        setError(null);
      } catch (err) {
        setError("Failed to load meetings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    let result = meetings;

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((m) => getMeetingStatus(m) === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Sort by date: upcoming first
    return result.sort((a, b) => {
      const aStatus = getMeetingStatus(a);
      const bStatus = getMeetingStatus(b);
      // Show LIVE first, then UPCOMING, then ENDED, then CANCELLED
      const statusOrder = { LIVE: 0, UPCOMING: 1, ENDED: 2, CANCELLED: 3 };
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });
  }, [meetings, filterStatus, searchQuery]);

  // Counts for filter badges
  const counts = useMemo(() => {
    return {
      all: meetings.length,
      UPCOMING: meetings.filter((m) => getMeetingStatus(m) === "UPCOMING").length,
      LIVE: meetings.filter((m) => getMeetingStatus(m) === "LIVE").length,
      ENDED: meetings.filter((m) => getMeetingStatus(m) === "ENDED").length,
      CANCELLED: meetings.filter((m) => getMeetingStatus(m) === "CANCELLED").length,
    };
  }, [meetings]);

  const clearFilters = () => {
    setFilterStatus("all");
    setSearchQuery("");
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Meetings</h1>
            <p className="text-sm text-ink-400">Join upcoming meetings and view recordings</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-48 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-10 w-32 bg-ink-100 animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-16 w-16 bg-ink-100 animate-pulse rounded-lg shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-full bg-ink-100 animate-pulse" />
                    <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                      <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY ========
  if (filteredMeetings.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Meetings</h1>
            <p className="text-sm text-ink-400">Join upcoming meetings and view recordings</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search meetings..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🎥</span>
            <p className="text-ink-500">No meetings found.</p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Check back later for upcoming meetings."}
            </p>
            {(searchQuery || filterStatus !== "all") && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  return (
    <MemberLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Meetings</h1>
          <p className="text-sm text-ink-400">
            {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search meetings..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchQuery || filterStatus !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ink-400">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "UPCOMING", "LIVE", "ENDED", "CANCELLED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                filterStatus === status
                  ? "bg-dawn-500 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {status === "all" ? "All" : STATUS_LABELS[status]?.label || status}
              {counts[status] > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Meetings list */}
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}

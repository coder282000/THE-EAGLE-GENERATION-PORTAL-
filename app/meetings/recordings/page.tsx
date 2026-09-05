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
  X,
  Play
} from "lucide-react";
import { mockMeetings, Meeting } from "@/components/mock/data";
import { format } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Upcoming", color: "bg-blue-100 text-blue-700" },
  LIVE: { label: "Live", color: "bg-green-100 text-green-700" },
  ENDED: { label: "Ended", color: "bg-ink-100 text-ink-600" },
  CANCELLED: { label: "Cancelled", color: "bg-clay-100 text-clay-700" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "All Members",
  CHAPTER: "Chapter Only",
  COHORT: "Cohort Only",
  MENTORSHIP: "Mentorship",
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "h:mm a");
}

// ============================================================
// Recording Card Component
// ============================================================

function RecordingCard({ meeting }: { meeting: Meeting }) {
  const status = meeting.status || "ENDED";
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.ENDED;
  const formattedDate = formatDate(meeting.scheduledFor);
  const formattedTime = formatTime(meeting.scheduledFor);
  const audienceLabel = AUDIENCE_LABELS[meeting.audience] || meeting.audience;

  return (
    <Card className="border border-ink-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Icon */}
        <div className="shrink-0 flex items-center justify-center h-14 w-14 rounded-lg bg-dawn-100 text-2xl">
          🎥
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/meetings/${meeting.id}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {meeting.title}
              </h3>
            </Link>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
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
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {audienceLabel}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          {meeting.recordingUrl && (
            <Button 
              variant="primary" 
              size="sm" 
              className="gap-1"
              onClick={() => window.open(meeting.recordingUrl, "_blank")}
            >
              <Play className="h-3.5 w-3.5" /> Watch Recording
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

export default function MeetingRecordingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [recordings, setRecordings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ENDED" | "LIVE" | "UPCOMING" | "CANCELLED">("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        // Filter meetings that have a recording URL
        const recordedMeetings = mockMeetings.filter((m) => m.recordingUrl);
        setRecordings(recordedMeetings);
        setError(null);
      } catch (err) {
        setError("Failed to load recordings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    let result = recordings;

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((m) => m.status === filterStatus);
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

    // Sort by date (most recent first)
    return result.sort((a, b) => 
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
  }, [recordings, filterStatus, searchQuery]);

  // Counts for filter badges
  const counts = useMemo(() => {
    return {
      all: recordings.length,
      ENDED: recordings.filter((m) => m.status === "ENDED").length,
      LIVE: recordings.filter((m) => m.status === "LIVE").length,
      UPCOMING: recordings.filter((m) => m.status === "UPCOMING").length,
      CANCELLED: recordings.filter((m) => m.status === "CANCELLED").length,
    };
  }, [recordings]);

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
            <h1 className="font-display text-2xl font-semibold text-ink-900">Meeting Recordings</h1>
            <p className="text-sm text-ink-400">Watch recorded meetings</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-48 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-10 w-32 bg-ink-100 animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-14 w-14 bg-ink-100 animate-pulse rounded-lg shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-full bg-ink-100 animate-pulse" />
                    <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
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
  if (filteredRecordings.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Meeting Recordings</h1>
            <p className="text-sm text-ink-400">Watch recorded meetings</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search recordings..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🎥</span>
            <p className="text-ink-500">No recordings found.</p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Recordings will appear here once meetings are recorded."}
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Meeting Recordings</h1>
          <p className="text-sm text-ink-400">
            {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search recordings by title or description..."
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
          {(["all", "ENDED", "LIVE", "UPCOMING", "CANCELLED"] as const).map((status) => (
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

        {/* Recordings list */}
        <div className="space-y-3">
          {filteredRecordings.map((meeting) => (
            <RecordingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
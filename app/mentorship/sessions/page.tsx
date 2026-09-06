"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { mockMentorshipSessions, mockMembers, mockMentors, MentorshipSession } from "@/components/mock/data";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";

// ============================================================
// Types
// ============================================================

type FilterType = "all" | "upcoming" | "past";

// ============================================================
// Session Card Component
// ============================================================

function SessionCard({ session, userId }: { session: MentorshipSession; userId: string }) {
  // Determine if user is mentor or mentee
  const isMentor = session.mentorId === userId;
  const otherUserId = isMentor ? session.menteeId : session.mentorId;
  const otherUser = mockMembers.find((m) => m.id === otherUserId);
  const displayName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown User";
  const initials = otherUser ? `${otherUser.firstName[0]}${otherUser.lastName[0]}` : "??";
  const isPastSession = isPast(new Date(session.scheduledAt));

  // Status styling
  const statusConfig = {
    SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: <Clock className="h-3.5 w-3.5" /> },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    CANCELLED: { label: "Cancelled", color: "bg-clay-100 text-clay-700", icon: <XCircle className="h-3.5 w-3.5" /> },
    MISSED: { label: "Missed", color: "bg-amber-100 text-amber-700", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  };

  const statusInfo = statusConfig[session.status] || statusConfig.SCHEDULED;
  const formattedDate = format(new Date(session.scheduledAt), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(session.scheduledAt), "h:mm a");
  const isUpcoming = session.status === "SCHEDULED" && isFuture(new Date(session.scheduledAt));

  return (
    <Card className="p-5 border border-ink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <Link href={`/profile/${otherUserId}`} className="shrink-0">
          <Avatar className="h-14 w-14">
            {otherUser?.avatar ? (
              <AvatarImage src={otherUser.avatar} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-dawn-100 text-dawn-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/profile/${otherUserId}`}>
                <h3 className="font-display font-semibold text-ink-900 hover:underline">
                  {displayName}
                </h3>
              </Link>
              <p className="text-xs text-ink-400">
                {isMentor ? "Mentee" : "Mentor"} • {otherUser?.chapter || "Member"}
              </p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formattedTime}
            </span>
            <span>•</span>
            <span>{session.durationMinutes} min</span>
          </div>

          {session.notes && (
            <p className="text-sm text-ink-600 mt-2 line-clamp-2">{session.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          {isUpcoming && session.meetingLink && (
            <Button variant="primary" size="sm" className="gap-1" onClick={() => window.open(session.meetingLink, "_blank")}>
              <Video className="h-3.5 w-3.5" /> Join Meeting
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function SessionHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "1"; // mock current user

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userSessions = mockMentorshipSessions.filter(
          (s) => s.mentorId === currentUserId || s.menteeId === currentUserId
        );
        setSessions(userSessions);
        setError(null);
      } catch (err) {
        setError("Failed to load sessions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let result = sessions;

    if (filter === "upcoming") {
      result = result.filter(
        (s) => s.status === "SCHEDULED" && isFuture(new Date(s.scheduledAt))
      );
    } else if (filter === "past") {
      result = result.filter(
        (s) => s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "MISSED" || isPast(new Date(s.scheduledAt))
      );
    }

    // Sort by date (newest first for upcoming, most recent first for past)
    return result.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [sessions, filter]);

  // Counts for badges
  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: sessions.length,
      upcoming: sessions.filter(
        (s) => s.status === "SCHEDULED" && isFuture(new Date(s.scheduledAt))
      ).length,
      past: sessions.filter(
        (s) => s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "MISSED" || isPast(new Date(s.scheduledAt))
      ).length,
    };
  }, [sessions]);

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Session History</h1>
            <p className="text-sm text-ink-400">View all your mentorship sessions</p>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-9 w-20 bg-ink-100 animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-14 w-14 rounded-full bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-48 bg-ink-100 animate-pulse" />
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
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY ========
  if (sessions.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Session History</h1>
            <p className="text-sm text-ink-400">View all your mentorship sessions</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">📅</span>
            <p className="text-ink-500">No sessions yet.</p>
            <p className="text-sm text-ink-400 mt-1">Schedule your first mentorship session!</p>
            <Link href="/mentorship/my-mentors">
              <Button variant="primary" size="sm" className="mt-4">
                View My Mentors
              </Button>
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY FILTERED ========
  if (filteredSessions.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Session History</h1>
            <p className="text-sm text-ink-400">View all your mentorship sessions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "upcoming", "past"] as FilterType[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                  filter === key
                    ? "bg-dawn-500 text-white"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {counts[key] > 0 && (
                  <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-ink-500">No {filter} sessions.</p>
            <p className="text-sm text-ink-400 mt-1">Try switching to a different filter.</p>
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Session History</h1>
          <p className="text-sm text-ink-400">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "upcoming", "past"] as FilterType[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                filter === key
                  ? "bg-dawn-500 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {counts[key] > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
          <Link href="/mentorship/sessions/new" className="ml-auto">
            <Button variant="primary" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" /> Schedule Session
            </Button>
          </Link>
        </div>

        {/* Session list */}
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} userId={currentUserId} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}

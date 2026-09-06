'use client';
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Repeat,
  User
} from "lucide-react";
import { mockMeetings, Meeting, mockMembers } from "@/components/mock/data";
import { format, formatDistanceToNow } from "date-fns";

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

// Helper: check if date is in the future
function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

// ============================================================
// Main Page Component
// ============================================================

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch meeting
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));

        const foundMeeting = mockMeetings.find((m) => m.id === meetingId);
        if (!foundMeeting) {
          setError("Meeting not found");
          setIsLoading(false);
          return;
        }
        setMeeting(foundMeeting);
        setError(null);
      } catch (err) {
        setError("Failed to load meeting. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  // Get creator info
  const creator = meeting ? mockMembers.find((m) => m.id === meeting.createdBy) : null;

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-ink-100 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
              <div className="h-4 w-full bg-ink-100 animate-pulse" />
              <div className="h-4 w-1/2 bg-ink-100 animate-pulse" />
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error || !meeting) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error || "Meeting not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/meetings")}>
            Back to Meetings
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  const status = getMeetingStatus(meeting);
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.UPCOMING;
  const isJoinable = status === "UPCOMING" || status === "LIVE";
  const formattedDate = formatDate(meeting.scheduledFor);
  const formattedTime = formatTime(meeting.scheduledFor);
  const audienceLabel = AUDIENCE_LABELS[meeting.audience] || meeting.audience;
  const timeUntil = formatDistanceToNow(new Date(meeting.scheduledFor), { addSuffix: true });

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Meetings
        </button>

        {/* Meeting Header */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">
                {meeting.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                  <span>{statusInfo.icon}</span> {statusInfo.label}
                </span>
                {meeting.isRecurring && (
                  <span className="text-[10px] font-medium bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Repeat className="h-3 w-3" /> Recurring
                  </span>
                )}
                {meeting.recordingUrl && (
                  <span className="text-[10px] font-medium bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                    📹 Recording Available
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formattedTime}
            </span>
            <span>•</span>
            <span>{meeting.durationMinutes} min</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {audienceLabel}
            </span>
            {isJoinable && (
              <span className="text-green-600">
                {status === "LIVE" ? "🔴 Live now" : `Starts ${timeUntil}`}
              </span>
            )}
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">About this Meeting</h2>
          <p className="text-sm text-ink-600 whitespace-pre-wrap">{meeting.description}</p>
        </Card>

        {/* Meeting Details */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Meeting Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-700 w-24">Date:</span>
              <span className="text-ink-600">{formattedDate}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-700 w-24">Time:</span>
              <span className="text-ink-600">{formattedTime}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-700 w-24">Duration:</span>
              <span className="text-ink-600">{meeting.durationMinutes} minutes</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-700 w-24">Audience:</span>
              <span className="text-ink-600">{audienceLabel}</span>
            </div>
            {meeting.isRecurring && meeting.recurrenceRule && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-700 w-24">Recurrence:</span>
                <span className="text-ink-600">{meeting.recurrenceRule}</span>
              </div>
            )}
            {creator && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-700 w-24">Created by:</span>
                <span className="text-ink-600">{creator.firstName} {creator.lastName}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink-700 w-24">Created:</span>
              <span className="text-ink-600">{format(new Date(meeting.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Meeting Link</p>
              <p className="text-sm text-ink-400">
                {isJoinable && meeting.meetingLink ? (
                  "Click the button to join the meeting."
                ) : status === "ENDED" ? (
                  "This meeting has ended."
                ) : status === "CANCELLED" ? (
                  "This meeting was cancelled."
                ) : (
                  "Meeting link will be available when it starts."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isJoinable && meeting.meetingLink && (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => window.open(meeting.meetingLink, "_blank")}
                >
                  <Video className="h-5 w-5" /> Join Meeting
                </Button>
              )}
              {meeting.recordingUrl && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => window.open(meeting.recordingUrl, "_blank")}
                >
                  <FileText className="h-5 w-5" /> View Recording
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}

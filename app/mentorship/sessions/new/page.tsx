"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { ArrowLeft, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { mockMentors, mockMembers, mockMentorshipSessions, mockMentorshipRequests } from "@/components/mock/data";
import { format } from "date-fns";

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export default function SessionSchedulingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mentorId = searchParams.get("mentorId");
  const menteeId = searchParams.get("menteeId");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherUserName, setOtherUserName] = useState("");

  // Determine if we're scheduling with a mentor or a mentee
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));

        let user = null;
        if (mentorId) {
          // We are scheduling with a mentor (from My Mentors or Find a Mentor)
          const mentor = mockMentors.find((m) => m.userId === mentorId);
          if (mentor) {
            user = mockMembers.find((m) => m.id === mentor.userId);
            setOtherUserName(user ? `${user.firstName} ${user.lastName}` : "Unknown Mentor");
          }
        } else if (menteeId) {
          // We are scheduling with a mentee (from My Mentees)
          user = mockMembers.find((m) => m.id === menteeId);
          setOtherUserName(user ? `${user.firstName} ${user.lastName}` : "Unknown Mentee");
        } else {
          setError("No mentor or mentee specified. Please go back and try again.");
          setIsLoading(false);
          return;
        }

        if (!user) {
          setError("User not found.");
          setIsLoading(false);
          return;
        }

        setOtherUser(user);
        // Set default datetime to 1 hour from now
        const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
        setScheduledAt(format(defaultTime, "yyyy-MM-dd'T'HH:mm"));

        setError(null);
      } catch (err) {
        setError("Failed to load user details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mentorId, menteeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledAt) {
      setFormError("Please select a date and time.");
      return;
    }

    if (new Date(scheduledAt) < new Date()) {
      setFormError("Please select a future date and time.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Determine mentorId and menteeId from context
      // If we have mentorId, we're scheduling with a mentor (current user is mentee)
      // If we have menteeId, we're scheduling with a mentee (current user is mentor)
      let finalMentorId = "";
      let finalMenteeId = "";
      const currentUserId = "1"; // mock current user

      if (mentorId) {
        finalMentorId = mentorId;
        finalMenteeId = currentUserId;
      } else if (menteeId) {
        finalMentorId = currentUserId;
        finalMenteeId = menteeId;
      } else {
        throw new Error("Invalid session context.");
      }

      // Find an existing request to link (or create a mock one)
      let requestId = "req-mock";
      const existingRequest = mockMentorshipRequests.find(
        (r) => r.mentorId === finalMentorId && r.menteeId === finalMenteeId && r.status === "ACCEPTED"
      );
      if (existingRequest) {
        requestId = existingRequest.id;
      } else {
        // Create a dummy request if none exists (just for mock)
        const newRequest = {
          id: `req-${Date.now()}`,
          mentorId: finalMentorId,
          menteeId: finalMenteeId,
          status: "ACCEPTED",
          focusArea: "General",
          message: "Auto-created for scheduling",
          requestedAt: new Date().toISOString(),
          respondedAt: new Date().toISOString(),
        };
        mockMentorshipRequests.push(newRequest);
        requestId = newRequest.id;
      }

      // Create session
      const newSession = {
        id: `sess-${Date.now()}`,
        requestId,
        mentorId: finalMentorId,
        menteeId: finalMenteeId,
        scheduledAt,
        durationMinutes,
        status: "SCHEDULED",
        notes: notes.trim() || undefined,
        meetingLink: "https://meet.google.com/mock-meeting-link",
      };

      mockMentorshipSessions.push(newSession);

      // Redirect to session history
      router.push("/mentorship/sessions");
    } catch (err) {
      setFormError("Failed to schedule session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-ink-100 animate-pulse" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-24 bg-ink-100 animate-pulse" />
                  <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/mentorship/my-mentors")}>
            Back to My Mentors
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== FORM ========
  const displayName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "User";
  const isMentorSession = !!mentorId;

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">Schedule Session</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Schedule a session with <span className="font-medium">{displayName}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Form error */}
            {formError && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label htmlFor="session-datetime" className="text-sm font-medium text-ink-700">
                Date & Time <span className="text-clay-500">*</span>
              </label>
              <Input
                id="session-datetime"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
                required
              />
              <p className="text-xs text-ink-400">Select a future date and time for the session.</p>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label htmlFor="session-duration" className="text-sm font-medium text-ink-700">
                Duration <span className="text-clay-500">*</span>
              </label>
              <select
                id="session-duration"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                disabled={isSubmitting}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="session-notes" className="text-sm font-medium text-ink-700">
                Notes (optional)
              </label>
              <Textarea
                id="session-notes"
                placeholder="Agenda, topics to discuss, or any special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-100">
              <p className="text-xs text-ink-400">
                <span className="text-clay-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!scheduledAt || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Scheduling...
                    </span>
                  ) : (
                    <Calendar className="h-4 w-4 mr-1" /> Schedule Session
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </MemberLayout>
  );
}
'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Calendar, Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import { mockMentors, mockMentorshipRequests, mockMentorshipSessions, mockMembers, Member } from "@/components/mock/data";

// ============================================================
// Mentee Card Component
// ============================================================

function MenteeCard({ mentee }: { mentee: Member }) {
  const initials = `${mentee.firstName[0]}${mentee.lastName[0]}`;

  // Find all sessions with this mentee where current user is the mentor
  // We'll assume current user (mentor) is "1" for mock; in real app we'd get from context
  // But we'll pass mentorId from parent or derive from requests
  // Since we're building a generic card, we can't know mentorId here unless we pass it.
  // For simplicity, we'll show session count from the mock data filtered by menteeId.
  // We'll get sessions where the menteeId matches and status is COMPLETED or SCHEDULED.
  const sessions = mockMentorshipSessions.filter((s) => s.menteeId === mentee.id);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED").length;

  // Find the mentorship request to get focus area
  const request = mockMentorshipRequests.find(
    (r) => r.menteeId === mentee.id && r.status === "ACCEPTED"
  );

  return (
    <Card className="p-5 border border-ink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <Link href={`/profile/${mentee.id}`} className="shrink-0">
          <Avatar className="h-16 w-16">
            {mentee.avatar ? (
              <AvatarImage src={mentee.avatar} alt={`${mentee.firstName} ${mentee.lastName}`} />
            ) : (
              <AvatarFallback className="bg-dawn-100 text-dawn-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/profile/${mentee.id}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {mentee.firstName} {mentee.lastName}
              </h3>
            </Link>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Active Mentee
            </span>
          </div>

          <p className="text-sm text-ink-500 mt-1">{mentee.bio || "No bio provided."}</p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {mentee.chapter}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Focus: {request?.focusArea || "General"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {sessions.length} sessions
            </span>
            {upcomingSessions > 0 && (
              <span className="text-green-600">• {upcomingSessions} upcoming</span>
            )}
            {completedSessions > 0 && (
              <span className="text-ink-400">• {completedSessions} completed</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {mentee.pillarInterest.map((pillar) => (
              <span key={pillar} className="text-[10px] font-medium bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">
                {pillar}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          <Link href={`/mentorship/sessions/new?menteeId=${mentee.id}`}>
            <Button variant="primary" size="sm">
              <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule Session
            </Button>
          </Link>
          <Link href={`/profile/${mentee.id}`}>
            <Button variant="outline" size="sm">
              View Profile
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

export default function MyMenteesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mentees, setMentees] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "1"; // mock current user (Grace Mwangi)

  // Fetch mentees where the current user is the mentor and request is ACCEPTED
  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Find accepted requests where current user is the mentor
        const acceptedRequests = mockMentorshipRequests.filter(
          (r) => r.mentorId === currentUserId && r.status === "ACCEPTED"
        );
        const menteeIds = acceptedRequests.map((r) => r.menteeId);
        const foundMentees = mockMembers.filter((m) => menteeIds.includes(m.id));
        setMentees(foundMentees);
        setError(null);
      } catch (err) {
        setError("Failed to load your mentees. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentees();
  }, []);

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentees</h1>
            <p className="text-sm text-ink-400">Members you are mentoring</p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-16 w-16 rounded-full bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-full bg-ink-100 animate-pulse" />
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
  if (mentees.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentees</h1>
            <p className="text-sm text-ink-400">Members you are mentoring</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🧑‍🎓</span>
            <p className="text-ink-500">You don't have any mentees yet.</p>
            <p className="text-sm text-ink-400 mt-1">Check your mentorship requests for pending approvals.</p>
            <Link href="/mentorship/requests">
              <Button variant="outline" size="sm" className="mt-4">
                View Requests →
              </Button>
            </Link>
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentees</h1>
          <p className="text-sm text-ink-400">
            {mentees.length} mentee{mentees.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Mentee list */}
        <div className="space-y-3">
          {mentees.map((mentee) => (
            <MenteeCard key={mentee.id} mentee={mentee} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}

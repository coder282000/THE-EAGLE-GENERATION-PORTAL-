'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Star, Calendar, MessageCircle, Users, Clock, ArrowRight } from "lucide-react";
import { mockMentors, mockMentorshipRequests, mockMentorshipSessions, mockMembers, MentorProfile } from "@/components/mock/data";

// ============================================================
// Mentor Card Component
// ============================================================

function MyMentorCard({ mentor }: { mentor: MentorProfile }) {
  const user = mockMembers.find((m) => m.id === mentor.userId);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Unknown Mentor";

  // Count sessions with this mentor
  const sessions = mockMentorshipSessions.filter((s) => s.mentorId === mentor.userId);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED").length;

  return (
    <Card className="p-5 border border-ink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <Link href={`/mentorship/mentors/${mentor.userId}`} className="shrink-0">
          <Avatar className="h-16 w-16">
            {mentor.avatar ? (
              <AvatarImage src={mentor.avatar} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-dawn-100 text-dawn-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/mentorship/mentors/${mentor.userId}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {displayName}
              </h3>
            </Link>
            {mentor.rating && (
              <span className="flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
                {mentor.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {mentor.availability}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {sessions.length} sessions
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {completedSessions} completed
            </span>
            {upcomingSessions > 0 && (
              <span className="text-green-600">• {upcomingSessions} upcoming</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {mentor.focusCategories.slice(0, 3).map((cat) => (
              <span key={cat} className="text-[10px] font-medium bg-dawn-100 text-dawn-700 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
            {mentor.focusCategories.length > 3 && (
              <span className="text-[10px] text-ink-400">+{mentor.focusCategories.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          <Link href={`/mentorship/sessions/new?mentorId=${mentor.userId}`}>
            <Button variant="primary" size="sm">
              <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule Session
            </Button>
          </Link>
          <Link href={`/mentorship/mentors/${mentor.userId}`}>
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

export default function MyMentorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "1"; // mock current user

  // Fetch mentors where the current user has an accepted request
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Find accepted requests
        const acceptedRequests = mockMentorshipRequests.filter(
          (r) => r.menteeId === currentUserId && r.status === "ACCEPTED"
        );
        const mentorIds = acceptedRequests.map((r) => r.mentorId);
        const foundMentors = mockMentors.filter((m) => mentorIds.includes(m.userId) && m.isActive);
        setMentors(foundMentors);
        setError(null);
      } catch (err) {
        setError("Failed to load your mentors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentors</h1>
            <p className="text-sm text-ink-400">Your approved mentorship connections</p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-16 w-16 rounded-full bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
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
  if (mentors.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentors</h1>
            <p className="text-sm text-ink-400">Your approved mentorship connections</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🧑‍🏫</span>
            <p className="text-ink-500">You don't have any mentors yet.</p>
            <p className="text-sm text-ink-400 mt-1">Find a mentor and start your journey!</p>
            <Link href="/mentorship/find">
              <Button variant="primary" size="sm" className="mt-4">
                Find a Mentor →
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">My Mentors</h1>
          <p className="text-sm text-ink-400">
            {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} connected
          </p>
        </div>

        {/* Mentor list */}
        <div className="space-y-3">
          {mentors.map((mentor) => (
            <MyMentorCard key={mentor.userId} mentor={mentor} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}

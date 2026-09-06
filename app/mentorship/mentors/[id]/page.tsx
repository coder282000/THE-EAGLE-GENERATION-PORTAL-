'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { PillarTag } from "@/components/pillarTag";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  Mail, 
  Calendar, 
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { mockMentors, mockMembers, mockMentorshipRequests, MentorProfile, MentorshipRequest } from "@/components/mock/data";

// ============================================================
// Request Modal Component
// ============================================================

function RequestModal({
  isOpen,
  onClose,
  mentorName,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-rise">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-ink-900">
            Request Mentorship
          </h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          Send a request to <span className="font-medium text-ink-900">{mentorName}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="request-message" className="text-sm font-medium text-ink-700">
              Message <span className="text-clay-500">*</span>
            </label>
            <textarea
              id="request-message"
              rows={4}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent resize-none"
              placeholder="Introduce yourself and explain why you'd like this mentor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!message.trim() || isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Request state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none");

  // Current user (mock: user '1' is logged in)
  const currentUserId = "1";

  // Fetch mentor data
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const found = mockMentors.find((m) => m.userId === mentorId);
        if (!found) {
          setError("Mentor not found");
          setIsLoading(false);
          return;
        }
        setMentor(found);

        // Check existing request status
        const existingRequest = mockMentorshipRequests.find(
          (r) => r.mentorId === mentorId && r.menteeId === currentUserId
        );
        if (existingRequest) {
          setRequestStatus(existingRequest.status as "pending" | "accepted" | "rejected");
        } else {
          setRequestStatus("none");
        }

        setError(null);
      } catch (err) {
        setError("Failed to load mentor profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  // Handle request submission
  const handleRequestSubmit = async (message: string) => {
    if (!mentor) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add request to mock data
      const newRequest: MentorshipRequest = {
        id: `req-${Date.now()}`,
        mentorId: mentor.userId,
        menteeId: currentUserId,
        status: "PENDING",
        focusArea: "General",
        message: message,
        requestedAt: new Date().toISOString(),
      };
      mockMentorshipRequests.push(newRequest);
      setRequestStatus("pending");
      setIsRequestModalOpen(false);
    } catch (err) {
      alert("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user details
  const user = useMemo(() => {
    if (!mentor) return null;
    return mockMembers.find((m) => m.id === mentor.userId);
  }, [mentor]);

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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-24 w-24 rounded-full bg-ink-100 animate-pulse shrink-0 mx-auto sm:mx-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-40 bg-ink-100 animate-pulse" />
                <div className="h-4 w-full bg-ink-100 animate-pulse" />
                <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                  <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <div className="h-6 w-32 bg-ink-100 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-ink-100 animate-pulse rounded" />
                  <div className="h-4 w-48 bg-ink-100 animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error || !mentor || !user) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error || "Mentor not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/mentorship/find")}>
            Back to Mentors
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const displayName = `${user.firstName} ${user.lastName}`;

  // Determine if the "Request" button should be shown and its text
  const renderRequestButton = () => {
    if (requestStatus === "pending") {
      return (
        <Button variant="outline" size="sm" disabled className="gap-1">
          <Clock className="h-4 w-4" /> Request Pending
        </Button>
      );
    }
    if (requestStatus === "accepted") {
      return (
        <Button variant="outline" size="sm" disabled className="gap-1 text-green-600 border-green-300">
          <CheckCircle className="h-4 w-4" /> Mentorship Active
        </Button>
      );
    }
    if (requestStatus === "rejected") {
      return (
        <Button variant="outline" size="sm" disabled className="gap-1 text-clay-500">
          <XCircle className="h-4 w-4" /> Request Declined
        </Button>
      );
    }
    return (
      <Button variant="primary" size="sm" onClick={() => setIsRequestModalOpen(true)} className="gap-1">
        <MessageCircle className="h-4 w-4" /> Request Mentorship
      </Button>
    );
  };

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Mentors
        </button>

        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <Avatar className="h-24 w-24">
                {mentor.avatar ? (
                  <AvatarImage src={mentor.avatar} alt={displayName} />
                ) : (
                  <AvatarFallback className="bg-dawn-100 text-dawn-700 text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-ink-900">
                    {displayName}
                  </h1>
                  <p className="text-sm text-ink-500">{user.email}</p>
                  <p className="text-sm text-ink-500">{user.chapter} • {user.tier}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {mentor.rating && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400" />
                      {mentor.rating.toFixed(1)} ({mentor.reviewCount} reviews)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-ink-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {mentor.currentMentees}/{mentor.capacity} mentees
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {mentor.availability}
                </span>
                <span>•</span>
                <span className={`${mentor.isActive ? "text-green-600" : "text-clay-500"}`}>
                  {mentor.isActive ? "🟢 Active" : "⚪ Inactive"}
                </span>
              </div>

              <div className="mt-3">
                {renderRequestButton()}
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-2">About</h2>
          <p className="text-sm text-ink-600 whitespace-pre-wrap">{mentor.bio}</p>
        </Card>

        {/* Focus Categories & Expertise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6">
            <h2 className="font-display text-sm font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Focus Areas
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.focusCategories.map((cat) => (
                <span key={cat} className="text-xs font-medium bg-dawn-100 text-dawn-700 px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-sm font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((exp) => (
                <span key={exp} className="text-xs font-medium bg-ink-50 text-ink-600 px-3 py-1 rounded-full">
                  {exp}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Request Modal */}
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          mentorName={displayName}
          onSubmit={handleRequestSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </MemberLayout>
  );
}

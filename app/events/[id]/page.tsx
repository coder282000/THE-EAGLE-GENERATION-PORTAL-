"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Clock,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { mockEvents, Event } from "@/components/mock/data";
import { format, isFuture, isPast } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const EVENT_TYPE_LABELS: Record<string, string> = {
  summit: "Summit",
  workshop: "Workshop",
  networking: "Networking",
  training: "Training",
  other: "Other",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  summit: "bg-ink-900 text-white",
  workshop: "bg-blue-100 text-blue-700",
  networking: "bg-green-100 text-green-700",
  training: "bg-amber-100 text-amber-700",
  other: "bg-clay-100 text-clay-700",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-green-100 text-green-700" },
  past: { label: "Past", color: "bg-ink-100 text-ink-600" },
  cancelled: { label: "Cancelled", color: "bg-clay-100 text-clay-700" },
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "EEEE, MMMM d, yyyy");
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "h:mm a");
}

function getStatus(event: Event): "upcoming" | "past" | "cancelled" {
  if (event.status === "cancelled") return "cancelled";
  const now = new Date();
  const eventDate = new Date(event.date);
  return isFuture(eventDate) ? "upcoming" : "past";
}

// ============================================================
// Main Page Component
// ============================================================

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundEvent = mockEvents.find((e) => e.id === eventId);
        if (!foundEvent) {
          setError("Event not found");
          setIsLoading(false);
          return;
        }
        setEvent(foundEvent);

        // Check if current user (mock '1') is registered
        // For mock, we'll check if the event has a registration entry (we'll maintain a mock registration list)
        // For simplicity, we'll use a mock set: we'll track in state and update on registration.
        // Initially, no events are registered.
        setIsRegistered(false);

        setError(null);
      } catch (err) {
        setError("Failed to load event. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Handle registration
  const handleRegister = async () => {
    if (!event) return;
    if (isRegistered) return;
    if (event.registered >= event.capacity) return;

    setIsRegistering(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update event registered count
      setEvent({
        ...event,
        registered: event.registered + 1,
      });
      setIsRegistered(true);
    } catch (err) {
      alert("Failed to register. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

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
              <div className="flex flex-wrap gap-2">
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

  // ======== ERROR / NOT FOUND ========
  if (error || !event) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error || "Event not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/events")}>
            Back to Events
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  const status = getStatus(event);
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.upcoming;
  const isUpcoming = status === "upcoming";
  const isSoldOut = event.registered >= event.capacity;
  const isPastEvent = status === "past";

  // Determine registration button state
  const renderRegistrationButton = () => {
    if (isPastEvent) {
      return (
        <Button variant="outline" size="lg" disabled>
          Event Passed
        </Button>
      );
    }
    if (event.status === "cancelled") {
      return (
        <Button variant="outline" size="lg" disabled>
          Cancelled
        </Button>
      );
    }
    if (isRegistered) {
      return (
        <Button variant="primary" size="lg" disabled className="gap-2">
          <CheckCircle className="h-5 w-5" /> Registered
        </Button>
      );
    }
    if (isSoldOut) {
      return (
        <Button variant="outline" size="lg" disabled>
          Sold Out
        </Button>
      );
    }
    return (
      <Button 
        variant="primary" 
        size="lg" 
        onClick={handleRegister}
        disabled={isRegistering}
        className="gap-2"
      >
        {isRegistering ? (
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Registering...
          </span>
        ) : (
          <>
            <UserPlus className="h-5 w-5" /> Register Now
          </>
        )}
      </Button>
    );
  };

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </button>

        {/* Event Header */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${EVENT_TYPE_COLORS[event.type]}`}>
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(event.date)}
              {event.endDate && ` — ${formatDate(event.endDate)}`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formatTime(event.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-ink-600">
              <Users className="h-4 w-4" /> {event.registered} / {event.capacity} registered
            </span>
            {event.price > 0 ? (
              <span className="flex items-center gap-1 font-medium text-ink-700">
                <CreditCard className="h-4 w-4" /> KES {event.price.toLocaleString()}
              </span>
            ) : (
              <span className="font-medium text-green-600">Free</span>
            )}
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">About this Event</h2>
          <p className="text-sm text-ink-600 whitespace-pre-wrap">{event.description}</p>
        </Card>

        {/* Registration / Actions */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Registration</p>
              <p className="text-sm text-ink-400">
                {isRegistered ? (
                  "You are registered for this event."
                ) : isSoldOut ? (
                  "This event is fully booked."
                ) : isPastEvent ? (
                  "This event has passed."
                ) : event.status === "cancelled" ? (
                  "This event has been cancelled."
                ) : (
                  `${event.capacity - event.registered} spots remaining`
                )}
              </p>
            </div>
            {renderRegistrationButton()}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
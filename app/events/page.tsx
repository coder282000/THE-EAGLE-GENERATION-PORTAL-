"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Clock,
  Search,
  Filter,
  X,
  ArrowRight
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

const EVENT_TYPE_ICONS: Record<string, string> = {
  summit: "🏛️",
  workshop: "🔧",
  networking: "🤝",
  training: "📚",
  other: "📌",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-green-100 text-green-700" },
  past: { label: "Past", color: "bg-ink-100 text-ink-600" },
  cancelled: { label: "Cancelled", color: "bg-clay-100 text-clay-700" },
};

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "summit", label: "Summit" },
  { value: "workshop", label: "Workshop" },
  { value: "networking", label: "Networking" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
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
// Event Card Component
// ============================================================

function EventCard({ event }: { event: Event }) {
  const status = getStatus(event);
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.upcoming;
  const typeIcon = EVENT_TYPE_ICONS[event.type] || "📌";
  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;

  return (
    <Card className="border border-ink-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date badge */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-center gap-2 sm:gap-0 bg-ink-50 rounded-lg p-3 sm:p-4 min-w-[70px]">
          <span className="text-2xl font-bold text-ink-900">
            {format(new Date(event.date), "dd")}
          </span>
          <span className="text-xs text-ink-400 uppercase">
            {format(new Date(event.date), "MMM")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/events/${event.id}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {event.title}
              </h3>
            </Link>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{event.description}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(event.date)}
              {event.endDate && ` — ${formatDate(event.endDate)}`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatTime(event.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${EVENT_TYPE_COLORS[event.type]}`}>
              {typeIcon} {typeLabel}
            </span>
            <span className="flex items-center gap-1 text-xs text-ink-400">
              <Users className="h-3.5 w-3.5" /> {event.registered} / {event.capacity}
            </span>
            {event.price > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-ink-700">
                <CreditCard className="h-3.5 w-3.5" /> KES {event.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs font-medium text-green-600">Free</span>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Link href={`/events/${event.id}`}>
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              View Details
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

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setEvents(mockEvents);
        setError(null);
      } catch (err) {
        setError("Failed to load events. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = events;

    // Type filter
    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((e) => getStatus(e) === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    // Sort: upcoming first
    return result.sort((a, b) => {
      const aStatus = getStatus(a);
      const bStatus = getStatus(b);
      if (aStatus === "upcoming" && bStatus !== "upcoming") return -1;
      if (aStatus !== "upcoming" && bStatus === "upcoming") return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [events, searchQuery, filterType, filterStatus]);

  // Get counts for status filter badges
  const counts = useMemo(() => {
    return {
      all: events.length,
      upcoming: events.filter((e) => getStatus(e) === "upcoming").length,
      past: events.filter((e) => getStatus(e) === "past").length,
      cancelled: events.filter((e) => getStatus(e) === "cancelled").length,
    };
  }, [events]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Events</h1>
            <p className="text-sm text-ink-400">Discover and register for upcoming events</p>
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
  if (filteredEvents.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Events</h1>
            <p className="text-sm text-ink-400">Discover and register for upcoming events</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search events..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">📅</span>
            <p className="text-ink-500">No events found.</p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Check back later for upcoming events."}
            </p>
            {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Events</h1>
          <p className="text-sm text-ink-400">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search events by title, description, or location..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ink-400">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "upcoming", "past", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                filterStatus === status
                  ? "bg-dawn-500 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {counts[status] > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
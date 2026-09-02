"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockEvents, Event } from "@/components/mock/data";

const eventTypes = ["all", "summit", "workshop", "networking", "training", "other"];

export default function EventsPage() {
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    let result = mockEvents;
    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filterType, search]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Events</h1>
            <p className="mt-1 text-sm text-ink-500">
              Discover and register for upcoming Eagle Generation events.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
              <input
                type="text"
                placeholder="Search events..."
                className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    filterType === type
                      ? "bg-ink-900 text-white shadow-sm"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-ink-400">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
          </p>

          {/* Event Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-4xl mb-3">📅</p>
              <h3 className="font-display text-lg font-semibold text-ink-900">No events found</h3>
              <p className="mt-1 text-sm text-ink-500">Try adjusting your search or filter.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event) => {
                const past = isPast(event.date);
                const isFull = event.registered >= event.capacity;
                return (
                  <Card key={event.id} className="p-5 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block rounded-full bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 capitalize">
                            {event.type}
                          </span>
                          <h3 className="mt-2 font-display font-semibold text-ink-900">
                            {event.title}
                          </h3>
                        </div>
                        {event.price === 0 ? (
                          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            Free
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-dawn-100 px-2.5 py-0.5 text-xs font-medium text-dawn-700">
                            KES {event.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-ink-600 leading-relaxed flex-1">
                        {event.description}
                      </p>

                      <div className="mt-3 space-y-1 text-xs text-ink-500">
                        <p>📅 {formatDate(event.date)} at {formatTime(event.date)}</p>
                        <p>📍 {event.location}</p>
                        <p>👥 {event.registered}/{event.capacity} registered</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ink-100">
                        {past ? (
                          <span className="text-xs text-ink-400">Past event</span>
                        ) : isFull ? (
                          <span className="text-xs text-clay-500">Fully booked</span>
                        ) : (
                          <Link href={`/events/${event.id}`}>
                            <Button variant="primary" >
                              Register Now
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-sm text-sky-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
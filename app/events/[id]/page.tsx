"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockEvents } from "@/components/mock/data";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const event = mockEvents.find((e) => e.id === id);

  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setRegistered(true);
  };

  if (!event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-6 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h2 className="font-display text-lg font-semibold text-ink-900">Event Not Found</h2>
          <p className="text-sm text-ink-500 mt-2">The event you're looking for doesn't exist.</p>
          <Link href="/events" className="mt-4 inline-block">
            <Button variant="secondary">← Back to Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPast = new Date(event.date) < new Date();
  const isFull = event.registered >= event.capacity;

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link href="/events" className="text-sm text-sky-600 hover:underline inline-flex items-center gap-1">
            ← Back to Events
          </Link>

          <Card className="p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600 capitalize">
                    {event.type}
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">{event.title}</h1>
                </div>
                {event.price === 0 ? (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Free
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-dawn-100 px-3 py-1 text-sm font-medium text-dawn-700">
                    KES {event.price.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="mt-3 text-ink-700 leading-relaxed">{event.description}</p>
            </div>

            <div className="border-t border-ink-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-ink-500">📅 Date</span>
                <p className="font-medium text-ink-900">{formatDate(event.date)}</p>
              </div>
              <div>
                <span className="text-ink-500">⏰ Time</span>
                <p className="font-medium text-ink-900">{formatTime(event.date)}</p>
              </div>
              <div>
                <span className="text-ink-500">📍 Location</span>
                <p className="font-medium text-ink-900">{event.location}</p>
              </div>
              <div>
                <span className="text-ink-500">👥 Capacity</span>
                <p className="font-medium text-ink-900">{event.registered} / {event.capacity} registered</p>
              </div>
            </div>

            {registered ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <h3 className="font-display text-lg font-semibold text-green-700">You're Registered!</h3>
                <p className="text-sm text-green-600">Check your email for confirmation and event details.</p>
                <Link href="/events/my-tickets" className="mt-3 inline-block">
                  <Button variant="secondary" size="sm">View My Tickets</Button>
                </Link>
              </div>
            ) : isPast ? (
              <div className="bg-ink-50 rounded-lg p-4 text-center">
                <p className="text-ink-500">This event has already passed.</p>
              </div>
            ) : isFull ? (
              <div className="bg-dawn-50 rounded-lg p-4 text-center">
                <p className="text-dawn-700 font-medium">Fully Booked</p>
                <p className="text-sm text-dawn-600">Join the waitlist to be notified if a spot opens.</p>
                <Button variant="secondary" size="sm" className="mt-2">Join Waitlist</Button>
              </div>
            ) : (
              <Button variant="primary" size="lg" fullWidth onClick={handleRegister} disabled={isLoading}>
                {isLoading ? "Processing..." : "Register Now"}
              </Button>
            )}

            {event.registrationDeadline && (
              <p className="text-xs text-ink-400 text-center">
                Registration closes {new Date(event.registrationDeadline).toLocaleDateString()}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
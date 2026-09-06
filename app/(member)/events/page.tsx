"use client";

import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";

// Mock events data
const events = [
  {
    id: 1,
    title: "Chapter Meeting – Kenyatta University",
    description: "Monthly chapter meeting to discuss upcoming initiatives and leadership development.",
    date: "2026-03-15T17:00:00",
    location: "KU Campus, Nairobi",
    type: "chapter",
  },
  {
    id: 2,
    title: "Leadership Summit 2026",
    description: "Annual summit bringing together Eagles from across East Africa for training and networking.",
    date: "2026-06-15T09:00:00",
    location: "Nairobi, Kenya",
    type: "summit",
  },
  {
    id: 3,
    title: "Tech Workshop: AI for Good",
    description: "Free hands-on workshop exploring AI applications for social impact.",
    date: "2026-03-12T14:00:00",
    location: "Online (Zoom)",
    type: "workshop",
  },
  {
    id: 4,
    title: "Networking Mixer – Nairobi Professional",
    description: "Professional networking event for members in the Nairobi area.",
    date: "2026-03-20T18:00:00",
    location: "Sarova Panafric, Nairobi",
    type: "networking",
  },
];

export default function EventsPage() {
  // Sort events by date (soonest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              Upcoming Events
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Stay connected and engaged with the Eagle Generation community.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>

        {sortedEvents.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <h3 className="font-display text-lg font-semibold text-ink-900">
              No upcoming events
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Check back later for new events.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedEvents.map((event) => {
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString("en-KE", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const formattedTime = eventDate.toLocaleTimeString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card key={event.id} className="p-5">
                  <div>
                    <span className="inline-block rounded-full bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600">
                      {event.type.toUpperCase()}
                    </span>
                    <h3 className="mt-2 font-display font-semibold text-ink-900">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-600">{event.description}</p>
                    <div className="mt-3 flex flex-col gap-1 text-sm text-ink-500">
                      <p>📅 {formattedDate} at {formattedTime}</p>
                      <p>📍 {event.location}</p>
                    </div>
                    <div className="mt-4">
                      <Button variant="secondary" onClick={() => alert("Event details coming soon")}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

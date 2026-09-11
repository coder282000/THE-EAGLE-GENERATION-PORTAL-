'use client';

// PNL-07 — Communications (landing)
// Route: /admin/communications

import Link from 'next/link';
import { Card } from '@/components/card';

export default function CommunicationsPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-07 · Communications</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Communications</h1>
        <p className="mt-1 text-sm text-ink/70">
          Announcements, notification templates, campaigns and delivery logs.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/announcements" className="block">
          <Card className="h-full hover:border-sky/40">
            <h2 className="text-sm font-semibold text-ink">Announcements</h2>
            <p className="mt-2 text-sm text-ink/70">
              Compose, target, schedule and track announcements. Read receipts on critical items.
            </p>
            <p className="mt-3 text-xs font-medium text-sky">Open announcements →</p>
          </Card>
        </Link>

        <Link href="/admin/notifications/templates" className="block">
          <Card className="h-full hover:border-sky/40">
            <h2 className="text-sm font-semibold text-ink">Notification templates</h2>
            <p className="mt-2 text-sm text-ink/70">
              Versioned email, SMS and push templates with merge field helpers.
            </p>
            <p className="mt-3 text-xs font-medium text-sky">Manage templates →</p>
          </Card>
        </Link>

        <Link href="/admin/notifications/campaigns" className="block">
          <Card className="h-full hover:border-sky/40">
            <h2 className="text-sm font-semibold text-ink">Campaigns</h2>
            <p className="mt-2 text-sm text-ink/70">
              Segment-targeted bulk messaging. Consent-aware. Live send summary.
            </p>
            <p className="mt-3 text-xs font-medium text-sky">Open campaigns →</p>
          </Card>
        </Link>

        <Link href="/admin/notifications/deliveries" className="block">
          <Card className="h-full hover:border-sky/40">
            <h2 className="text-sm font-semibold text-ink">Delivery log</h2>
            <p className="mt-2 text-sm text-ink/70">
              Every message sent. Bounces, opt-outs and failures with retry.
            </p>
            <p className="mt-3 text-xs font-medium text-sky">View delivery log →</p>
          </Card>
        </Link>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">About this panel</h2>
        <p className="mt-2 text-sm text-ink/70">
          Communications is delivered by three surfaces: announcements (broadcast to all or a
          chapter), notification templates (structured messages triggered by events), and campaigns
          (segment-targeted bulk messaging). Delivery is channelled through Postmark/SES for email
          and Africa&apos;s Talking for SMS.
        </p>
      </Card>
    </div>
  );
}
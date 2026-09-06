'use client';
import { StatusPage } from "@/components/status/statuspage";

export default function SuspendedPage() {
  return (
    <StatusPage
      title="Account Suspended"
      message="Your account has been temporarily suspended. This may be due to a policy violation or unusual activity. Please contact support for more information."
      emoji="⛔"
      actions={[
        { label: "Contact Support", href: "/help/support", variant: "primary" },
        { label: "Go Home", href: "/", variant: "secondary" },
      ]}
    >
      <div className="bg-clay-50 border border-clay-200 rounded-lg p-4 max-w-sm mx-auto">
        <p className="text-sm text-clay-800">
          If you believe this is a mistake, please reach out to our support team.
          We're here to help resolve any issues.
        </p>
        <p className="text-xs text-clay-600 mt-2">
          Reference: <span className="font-mono">SUS-2026-04-15</span>
        </p>
      </div>
    </StatusPage>
  );
}

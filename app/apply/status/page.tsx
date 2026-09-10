'use client';
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { mockApplications } from "@/components/mock/data";

// Helper to get status colour and label
const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    approved: {
      label: "Approved",
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "âœ…",
    },
    pending: {
      label: "Under Review",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "â³",
    },
    rejected: {
      label: "Not Approved",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "âŒ",
    },
  };
  return map[status] || map.pending;
};

export default function StatusCheckPage() {
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    application?: typeof mockApplications[0];
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ref = reference.trim();
    if (!ref) {
      setResult({ found: false, error: "Please enter a reference number." });
      return;
    }

    setIsLoading(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const app = mockApplications.find(
      (a) => a.reference.toLowerCase() === ref.toLowerCase()
    );

    if (app) {
      setResult({ found: true, application: app });
    } else {
      setResult({
        found: false,
        error: "No application found with that reference number.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">
            Check Your Application Status
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Enter your reference number to see where your application stands.
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              id="status-reference"
              label="Reference Number"
              placeholder="e.g., TEG-2026-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              disabled={isLoading}
              hint="Found in your confirmation email or application receipt."
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Status"}
            </Button>
          </form>
        </Card>

        {/* Result Display */}
        {result && (
          <Card className="p-6 animate-rise">
            {result.error ? (
              <div className="flex items-start gap-3 text-clay-700">
                <span className="text-2xl">ðŸ”</span>
                <div>
                  <p className="font-semibold">Not Found</p>
                  <p className="text-sm">{result.error}</p>
                  <p className="mt-2 text-xs text-ink-400">
                    Doubleâ€‘check your reference number or contact support if you believe this is an error.
                  </p>
                </div>
              </div>
            ) : (
              result.application && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-ink-500">Applicant</p>
                      <p className="font-display text-xl font-semibold text-ink-900">
                        {result.application.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink-500">Tier</p>
                      <p className="font-medium text-ink-700">
                        {result.application.tier}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                    <div>
                      <p className="text-sm text-ink-500">Reference</p>
                      <p className="font-mono text-sm font-medium text-ink-700">
                        {result.application.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink-500">Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                          getStatusInfo(result.application.status).bg
                        } ${getStatusInfo(result.application.status).text}`}
                      >
                        {getStatusInfo(result.application.status).icon}
                        {getStatusInfo(result.application.status).label}
                      </span>
                    </div>
                  </div>

                  {result.application.status === "APPROVED" &&
                    result.application.interviewAt && (
                      <div className="rounded-md bg-sky-50 p-3 text-sm text-sky-700">
                        <span className="font-medium">Interview scheduled:</span>{" "}
                        {new Date(result.application.interviewAt).toLocaleDateString(
                          "en-KE",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    )}
                </div>
              )
            )}
          </Card>
        )}

        {/* Link back to apply */}
        <p className="text-center text-sm text-ink-400">
          Haven't applied yet?{" "}
          <Link
            href="/apply"
            className="font-medium text-sky-600 hover:underline"
          >
            Start your application â†’
          </Link>
        </p>
      </div>
    </div>
  );
}

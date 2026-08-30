"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockApplications, mockMembers } from "@/components/mock/data";

type Decision = "approve" | "reject" | null;

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.id as string;

  // Find the application by reference
  const application = useMemo(() => {
    return mockApplications.find((app) => app.reference === reference);
  }, [reference]);

  // State for decision
  const [decision, setDecision] = useState<Decision>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Generate mock timeline based on application status
  const timeline = useMemo(() => {
    if (!application) return [];

    const items = [];
    const submittedDate = new Date();
    // Use interviewDate if available, else generate a date
    if (application.interviewDate) {
      submittedDate.setDate(submittedDate.getDate() - 5);
    } else {
      submittedDate.setDate(submittedDate.getDate() - 7);
    }

    items.push({
      action: "Application submitted",
      by: application.name,
      date: submittedDate.toISOString().split('T')[0],
      status: "submitted"
    });

    if (application.status === "pending") {
      // If pending, add "Under review" step
      const reviewDate = new Date(submittedDate);
      reviewDate.setDate(reviewDate.getDate() + 2);
      items.push({
        action: "Under review",
        by: "Admin",
        date: reviewDate.toISOString().split('T')[0],
        status: "reviewing"
      });
    } else if (application.status === "approved") {
      // Approved: add review and approved steps
      const reviewDate = new Date(submittedDate);
      reviewDate.setDate(reviewDate.getDate() + 2);
      items.push({
        action: "Under review",
        by: "Admin",
        date: reviewDate.toISOString().split('T')[0],
        status: "reviewing"
      });
      const approvedDate = new Date(reviewDate);
      approvedDate.setDate(approvedDate.getDate() + 3);
      items.push({
        action: "Application approved",
        by: "Admin",
        date: approvedDate.toISOString().split('T')[0],
        status: "approved"
      });
      if (application.interviewDate) {
        const interviewDateObj = new Date(application.interviewDate);
        items.push({
          action: "Interview scheduled",
          by: "Admin",
          date: application.interviewDate,
          status: "interview"
        });
      }
    } else if (application.status === "rejected") {
      // Rejected: add review and reject steps
      const reviewDate = new Date(submittedDate);
      reviewDate.setDate(reviewDate.getDate() + 2);
      items.push({
        action: "Under review",
        by: "Admin",
        date: reviewDate.toISOString().split('T')[0],
        status: "reviewing"
      });
      const rejectDate = new Date(reviewDate);
      rejectDate.setDate(rejectDate.getDate() + 1);
      items.push({
        action: "Application rejected",
        by: "Admin",
        date: rejectDate.toISOString().split('T')[0],
        status: "rejected"
      });
    }

    return items;
  }, [application]);

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-dawn-50 text-dawn-700",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-clay-50 text-clay-700",
    };
    return styles[status] || "bg-ink-50 text-ink-600";
  };

  if (!application) {
    return (
      <AdminLayout>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-ink-500">Application not found.</p>
          <Link href="/admin/applications" className="mt-3 text-sm font-medium text-sky-600 hover:underline">
            ← Back to applications
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const handleDecision = (action: "approve" | "reject") => {
    setDecision(action);
    setShowReason(true);
  };

  const handleSubmitDecision = async () => {
    if (!decision) return;
    if (!decisionReason.trim() && decision === "reject") {
      setToast({ type: "error", message: "Please provide a reason for rejection." });
      return;
    }

    setIsSubmitting(true);
    setToast(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    setToast({
      type: "success",
      message: `Application ${decision === "approve" ? "approved" : "rejected"} successfully.`,
    });

    // In a real app, this would persist the decision
    setTimeout(() => {
      router.push("/admin/applications");
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/applications"
                className="text-ink-400 hover:text-ink-600 transition-colors"
              >
                ←
              </Link>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Application Details
              </h1>
            </div>
            <p className="mt-1 text-sm text-ink-500 font-mono">
              {application.reference}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => window.print()}>
              🖨️ Print
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`flex items-center gap-3 rounded-lg p-4 text-sm ${
              toast.type === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-clay-200 bg-clay-50 text-clay-700"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.message}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant info */}
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink-900">Applicant Information</h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink-400">Full Name</dt>
                  <dd className="text-sm font-medium text-ink-900">{application.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Email</dt>
                  <dd className="text-sm text-ink-900">{application.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Tier</dt>
                  <dd className="text-sm font-medium text-ink-900">{application.tier}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Chapter</dt>
                  <dd className="text-sm text-ink-900">{application.chapter}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink-400">Motivation</dt>
                  <dd className="mt-1 text-sm text-ink-700 leading-relaxed">
                    {application.motivation}
                  </dd>
                </div>
                {application.interviewDate && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-ink-400">Interview Date</dt>
                    <dd className="text-sm text-ink-900">
                      {new Date(application.interviewDate).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Pillar interests */}
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink-900">Pillar Interests</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {/* Mock pillar interests for demonstration – you could store these in mock data */}
                <span className="rounded-full bg-dawn-50 px-3 py-1 text-xs font-medium text-dawn-700">Marketplace</span>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">Governance</span>
                <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700">Technology</span>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink-900">Application Timeline</h2>
              <div className="mt-4 space-y-4 border-l border-ink-100 pl-4">
                {timeline.map((item, index) => {
                  const dotColor =
                    item.status === "approved"
                      ? "bg-green-400"
                      : item.status === "rejected"
                      ? "bg-clay-400"
                      : item.status === "interview"
                      ? "bg-sky-400"
                      : "bg-dawn-400";
                  return (
                    <div key={index} className="relative">
                      <span
                        className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-4 ring-white ${dotColor}`}
                      />
                      <p className="text-sm text-ink-700">
                        <span className="font-medium">{item.action}</span>
                      </p>
                      <p className="text-xs text-ink-400">
                        {item.by} · {new Date(item.date).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6">
            {/* Status card */}
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink-900">Status</h2>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
                <span className="text-xs text-ink-400">
                  Updated {new Date().toLocaleDateString()}
                </span>
              </div>
            </Card>

            {/* Decision actions */}
            {application.status === "pending" && (
              <Card>
                <h2 className="font-display text-sm font-semibold text-ink-900">Actions</h2>
                <div className="mt-4 space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handleDecision("approve")}
                    disabled={!!decision}
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    fullWidth
                    onClick={() => handleDecision("reject")}
                    disabled={!!decision}
                  >
                    ❌ Reject
                  </Button>

                  {showReason && (
                    <div className="mt-4 space-y-3 border-t border-ink-100 pt-4">
                      <label className="text-sm font-medium text-ink-700">
                        {decision === "approve" ? "Optional note" : "Reason for rejection *"}
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        placeholder={decision === "approve" ? "Add a note (optional)..." : "Provide reason for rejection..."}
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleSubmitDecision}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : `Confirm ${decision === "approve" ? "Approval" : "Rejection"}`}
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            setShowReason(false);
                            setDecision(null);
                            setDecisionReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick links */}
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink-900">Quick Links</h2>
              <div className="mt-3 space-y-2">
                <Link
                  href={`mailto:${application.email}`}
                  className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
                >
                  ✉️ Email Applicant
                </Link>
                <button
                  onClick={() => alert("Interview scheduling form would open here.")}
                  className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
                >
                  📅 Schedule Interview
                </button>
                <Link
                  href="/admin/audit"
                  className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
                >
                  📋 View Audit Trail
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
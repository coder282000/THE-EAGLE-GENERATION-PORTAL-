"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { Label } from "@/components/ui/label";

export type ReportType = "POST" | "COMMENT" | "MESSAGE" | "PROFILE" | "GROUP";

export interface ReportData {
  type: ReportType;
  id: string;
  title?: string;
  author?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportData;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "spam", label: "Spam or misleading content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "violence", label: "Violence or threatening behaviour" },
  { value: "privacy", label: "Privacy violation" },
  { value: "other", label: "Other" },
];

export function ReportModal({ isOpen, onClose, data }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const report = {
        type: data.type,
        id: data.id,
        reason: selectedReason,
        description: description.trim(),
        reportedAt: new Date().toISOString(),
      };

      console.log("Report submitted:", report);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSelectedReason("");
        setDescription("");
      }, 2000);
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("");
      setDescription("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-ink-900">
            Report {data.type.toLowerCase()}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-ink-900 font-medium">Report submitted</p>
            <p className="text-sm text-ink-400 mt-1">
              Our moderation team will review this shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
              <p className="font-medium">You are reporting:</p>
              <p className="mt-0.5">
                {data.title || `${data.type} by ${data.author || "Unknown"}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-reason" className="text-sm font-medium text-ink-700">
                Reason for reporting <span className="text-clay-500">*</span>
              </Label>
              <select
                id="report-reason"
                value={selectedReason}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              {error && !selectedReason && (
                <p className="text-xs text-clay-500">{error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description" className="text-sm font-medium text-ink-700">
                Additional details (optional)
              </Label>
              <Textarea
                id="report-description"
                placeholder="Provide any additional context or evidence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-ink-400 text-right">
                {description.length} characters
              </p>
            </div>

            {error && selectedReason && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-wrap gap-3">
          {!success && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
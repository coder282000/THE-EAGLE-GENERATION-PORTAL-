// components/modals/reportModal.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';

export type ReportType = 'POST' | 'COMMENT' | 'MESSAGE' | 'PROFILE' | 'GROUP';

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
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'spam', label: 'Spam or misleading content' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'violence', label: 'Violence or threatening behaviour' },
  { value: 'privacy', label: 'Privacy violation' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ isOpen, onClose, data }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Build report object
      const report = {
        type: data.type,
        id: data.id,
        reason: selectedReason,
        description: description.trim(),
        reportedAt: new Date().toISOString(),
      };

      console.log('Report submitted:', report);

      // Show success, then close after a delay
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setDescription('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // If the modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Report {data.type.toLowerCase()}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center">
              <span className="text-4xl block mb-3">✅</span>
              <p className="text-gray-900 font-medium">Report submitted</p>
              <p className="text-sm text-gray-500 mt-1">
                Our moderation team will review this shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Context */}
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p className="font-medium">You are reporting:</p>
                <p className="mt-0.5">
                  {data.title || `${data.type} by ${data.author || 'Unknown'}`}
                </p>
              </div>

              {/* Reason select */}
              <div className="space-y-2">
                <label htmlFor="report-reason" className="text-sm font-medium text-gray-700">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <select
                  id="report-reason"
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="report-description" className="text-sm font-medium text-gray-700">
                  Additional details (optional)
                </label>
                <Textarea
                  id="report-description"
                  placeholder="Provide any additional context or evidence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <p className="text-xs text-gray-400 text-right">
                  {description.length} characters
                </p>
              </div>

              {/* Error message */}
              {error && selectedReason && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
          {!success && (
            <>
              <Button
                type="button"
                variant="secondary"
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
                  'Submit Report'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
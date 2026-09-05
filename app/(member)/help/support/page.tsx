"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { TextInput } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Select } from "@/components/select";
import { Button } from "@/components/button";

// Mock categories for the dropdown
const SUPPORT_CATEGORIES = [
  { value: "membership", label: "Membership" },
  { value: "payments", label: "Payments & Billing" },
  { value: "technical", label: "Technical Issue" },
  { value: "learning", label: "Learning & Courses" },
  { value: "community", label: "Community & Events" },
  { value: "general", label: "General Inquiry" },
];

export default function ContactSupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    subject?: string;
    message?: string;
  }>({});

  const validate = (): boolean => {
    const errors: { subject?: string; message?: string } = {};
    if (!subject.trim()) errors.subject = "Subject is required";
    if (!message.trim()) errors.message = "Message is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <MemberLayout>
        <div className="container-portal py-6 max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-ink-900 mb-2">
              Support ticket submitted
            </h2>
            <p className="text-ink-600 mb-6">
              Thank you for reaching out. Our support team will get back to you
              within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/help">
                <Button variant="secondary">Return to Help Centre</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Form
  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/help"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
          >
            ← Back to Help Centre
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-900 mt-2">
            Contact Support
          </h1>
          <p className="text-ink-500 mt-1">
            Submit a support request and our team will assist you.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-clay-50 border border-clay-200 rounded text-clay-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            id="support-subject"
            label="Subject"
            placeholder="Brief summary of your issue"
            value={subject}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            error={validationErrors.subject}
            disabled={isSubmitting}
            required
          />

          <Select
            id="support-category"
            label="Category"
            value={category}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            options={SUPPORT_CATEGORIES}
            disabled={isSubmitting}
          />

          <Textarea
            id="support-message"
            label="Message"
            placeholder="Provide as much detail as possible to help us assist you."
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            rows={6}
            error={validationErrors.message}
            disabled={isSubmitting}
            required
          />

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  setAttachment(e.target.files[0]);
                }
              }}
              disabled={isSubmitting}
              className="block w-full text-sm text-ink-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-paper file:text-ink-700
                hover:file:bg-ink-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-ink-400 mt-1">
              You can attach a screenshot or document (max 5MB).
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
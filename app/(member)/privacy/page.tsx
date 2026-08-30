"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockMembers } from "@/components/mock/data";

// Simulate current user
const CURRENT_USER = mockMembers[0];

export default function PrivacyPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Consent toggles
  const [consents, setConsents] = useState({
    marketingEmails: true,
    profileVisibility: true,
    dataSharing: false,
  });

  const handleConsentToggle = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
    setToast({
      type: "success",
      message: `Consent updated: ${key.replace(/([A-Z])/g, " $1")} is now ${!consents[key] ? "enabled" : "disabled"}.`,
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setToast(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    setToast({
      type: "success",
      message: "Your data export is ready. A download link has been sent to your email.",
    });
    setTimeout(() => setToast(null), 5000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action is irreversible and all your data will be permanently removed.")) {
      return;
    }
    setIsDeleting(true);
    setToast(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setToast({
      type: "error",
      message: "Account deletion request submitted. You will receive a confirmation email shortly.",
    });
    setTimeout(() => router.push("/login"), 3000);
  };

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Privacy & Data Rights
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your personal data and privacy preferences.
          </p>
        </div>

        {/* Toast notification */}
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

        {/* Data Rights Section */}
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            Your Data Rights
          </h2>
          <p className="mt-2 text-sm text-ink-700 leading-relaxed">
            In compliance with Kenya's Data Protection Act (DPA) and the EU General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-600 list-disc pl-5">
            <li><strong>Right to Access</strong> – Request a copy of all personal data we hold about you.</li>
            <li><strong>Right to Rectify</strong> – Correct inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure</strong> – Request deletion of your data (subject to legal obligations).</li>
            <li><strong>Right to Restrict Processing</strong> – Limit how we use your data.</li>
            <li><strong>Right to Data Portability</strong> – Receive your data in a structured, machine‑readable format.</li>
            <li><strong>Right to Withdraw Consent</strong> – Withdraw consent at any time.</li>
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            For any privacy-related questions, contact our Data Protection Officer at <strong>dpo@eaglegeneration.org</strong>.
          </p>
        </Card>

        {/* Consent Management */}
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            Consent Preferences
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Choose how we use your data.
          </p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <p className="font-medium text-ink-900">Marketing emails</p>
                <p className="text-xs text-ink-400">Receive updates about events, offers, and news.</p>
              </div>
              <button
                onClick={() => handleConsentToggle("marketingEmails")}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  consents.marketingEmails ? "bg-dawn-400" : "bg-ink-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    consents.marketingEmails ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <p className="font-medium text-ink-900">Profile visibility</p>
                <p className="text-xs text-ink-400">Allow other members to see your profile in the directory.</p>
              </div>
              <button
                onClick={() => handleConsentToggle("profileVisibility")}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  consents.profileVisibility ? "bg-dawn-400" : "bg-ink-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    consents.profileVisibility ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900">Data sharing with partners</p>
                <p className="text-xs text-ink-400">Share anonymised data with research and development partners.</p>
              </div>
              <button
                onClick={() => handleConsentToggle("dataSharing")}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  consents.dataSharing ? "bg-dawn-400" : "bg-ink-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    consents.dataSharing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Data Actions */}
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            Data Actions
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-100 pb-4">
              <div>
                <p className="font-medium text-ink-900">Export my data</p>
                <p className="text-sm text-ink-500">Download all personal data we hold about you.</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? "Preparing..." : "Request Export"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-clay-600">Delete my account</p>
                <p className="text-sm text-ink-500">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Processing..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Back link */}
        <div>
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back to Profile
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
}
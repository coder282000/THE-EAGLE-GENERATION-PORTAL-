// app/profile/verification/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockKYCSubmissions, KYCSubmission } from '@/components/mock/data';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

// Mock current user ID (in a real app, this would come from auth)
const CURRENT_USER_ID = '1';

// Find the current user's KYC submission, or create a default if none exists
const getCurrentUserKYC = (): KYCSubmission => {
  const existing = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);
  if (existing) return existing;
  // Default "not started" state
  return {
    id: `kyc_${Date.now()}`,
    userId: CURRENT_USER_ID,
    tier: 'basic',
    status: 'not_started',
    documents: [],
  };
};

const STATUS_BADGE_STYLES = {
  not_started: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  not_started: 'Not Started',
  pending: 'Under Review',
  approved: 'Verified',
  rejected: 'Rejected',
};

const TIER_LABELS = {
  basic: 'Basic Verification',
  enhanced: 'Enhanced Verification',
};

const VERIFICATION_STEPS = [
  { id: 'identity', label: 'Identity Document', route: '/verify/identity' },
  { id: 'liveness', label: 'Selfie / Liveness Check', route: '/verify/liveness' },
  { id: 'address', label: 'Address & Additional Info', route: '/verify/address' },
];

export default function VerificationPage() {
  const router = useRouter();
  const kyc = getCurrentUserKYC();

  const statusBadge = STATUS_BADGE_STYLES[kyc.status] || 'bg-gray-100 text-gray-700';
  const statusLabel = STATUS_LABELS[kyc.status] || kyc.status;
  const tierLabel = TIER_LABELS[kyc.tier] || kyc.tier;

  // Determine which steps are completed based on documents
  const completedSteps = kyc.documents.map((doc) => doc.type);
  const isStepCompleted = (stepId: string) => {
    if (kyc.status === 'approved') return true;
    if (kyc.status === 'rejected') return false;
    return completedSteps.includes(stepId as any);
  };

  const allStepsCompleted = VERIFICATION_STEPS.every((step) =>
    isStepCompleted(step.id)
  );

  const handleStartVerification = () => {
    router.push('/verify/identity');
  };

  const handleResubmit = () => {
    // For rejected status, start over
    router.push('/verify/identity');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Verification Status
      </h1>
      <p className="text-gray-500 mb-8">
        Complete your identity verification to unlock all features and higher tiers.
      </p>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Current Status</span>
              <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', statusBadge)}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Tier: <span className="font-medium">{tierLabel}</span>
            </p>
            {kyc.rejectionReason && (
              <p className="text-sm text-red-600 mt-2">
                <span className="font-medium">Reason:</span> {kyc.rejectionReason}
              </p>
            )}
          </div>
          <div>
            {kyc.status === 'not_started' && (
              <Button variant="primary" onClick={handleStartVerification}>
                Start Verification
              </Button>
            )}
            {kyc.status === 'pending' && (
              <Button variant="secondary" disabled>
                ⏳ Under Review
              </Button>
            )}
            {kyc.status === 'approved' && (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl">✅</span>
                <span className="font-medium">Verified</span>
              </div>
            )}
            {kyc.status === 'rejected' && (
              <Button variant="primary" onClick={handleResubmit}>
                🔄 Resubmit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Steps</h2>
        <div className="space-y-4">
          {VERIFICATION_STEPS.map((step, index) => {
            const completed = isStepCompleted(step.id);
            const isCurrent = !completed && kyc.status !== 'approved' && kyc.status !== 'rejected';
            const isLocked = kyc.status === 'pending' || kyc.status === 'approved' || (kyc.status === 'rejected' && !completed);

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 flex-shrink-0',
                      completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    )}
                  >
                    {completed ? '✓' : index + 1}
                  </div>
                  {index < VERIFICATION_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-0.5 h-8',
                        completed ? 'bg-green-500' : 'bg-gray-300'
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{step.label}</h3>
                    {completed && <span className="text-sm text-green-600">✓ Done</span>}
                  </div>
                  {isCurrent && (
                    <p className="text-sm text-blue-600">Waiting for you to complete</p>
                  )}
                  {isLocked && !completed && (
                    <p className="text-sm text-gray-400">Locked</p>
                  )}
                  {kyc.status === 'rejected' && !completed && (
                    <Link
                      href={step.route}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Re-upload
                    </Link>
                  )}
                  {!isLocked && !completed && kyc.status !== 'rejected' && (
                    <Link
                      href={step.route}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion message */}
        {kyc.status === 'approved' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-green-700">✅ Your identity is verified. You have full access to all features.</p>
          </div>
        )}
        {kyc.status === 'pending' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <p className="text-yellow-700">⏳ Your verification is being reviewed. We'll notify you once it's complete.</p>
            <p className="text-sm text-yellow-600 mt-1">This usually takes 24-48 hours.</p>
          </div>
        )}
        {kyc.status === 'not_started' && allStepsCompleted && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-blue-700">All steps are ready. Click "Start Verification" above to begin.</p>
          </div>
        )}
        {kyc.status === 'rejected' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-red-700">❌ Your verification was rejected. Please review the reason and resubmit.</p>
          </div>
        )}
      </div>
    </div>
  );
}

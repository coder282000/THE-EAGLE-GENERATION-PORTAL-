// lib/mock/applications.ts
'use client';

import {
  mockApplications,
  mockApplicationNotes,
  mockApplicationAnalytics,
  Application,
  ApplicationNote,
  ApplicationStatus,
  ApplicationTier,
  ApplicationPillar,
  PENDING_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TIER_LABELS,
  ApplicationAnalytics,
} from '@/components/mock/data';
import { getCurrentUser } from './current-user';

// ─────────────────────────────────────────────────────────────────
// Filter shape
// ─────────────────────────────────────────────────────────────────

export interface ApplicationFilter {
  status?: ApplicationStatus | 'ALL';
  tier?: ApplicationTier | 'ALL';
  chapterCode?: string | 'ALL';
  pillar?: ApplicationPillar | 'ALL';
  search?: string;
}

// ─────────────────────────────────────────────────────────────────
// RLS simulation — mirrors what the API will do server-side
// ─────────────────────────────────────────────────────────────────

/**
 * Simulates the server's RLS + application-layer authorisation.
 * When the real API arrives, this function is replaced by a fetch call.
 *
 * Rules (matching Chapter 12.2 and the RLS policy in 19.2):
 *   - ADMIN, SUPER_ADMIN: all applications
 *   - CHAPTER_LEADER:      own chapter only (chapterCode match)
 *   - FINANCE_OFFICER:     none
 *   - MEMBER, MENTOR, CIRCLE_LEADER: none
 */
export function getApplications(filter: ApplicationFilter = {}): Application[] {
  const user = getCurrentUser();

  // Deny by default
  if (!['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER'].includes(user.role)) {
    return [];
  }

  let apps = [...mockApplications];

  // Simulate RLS: chapter-scoped users see only their chapter
  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return [];
    apps = apps.filter((a) => a.chapterCode === user.chapterCode);
  }

  // Apply filters
  if (filter.status && filter.status !== 'ALL') {
    apps = apps.filter((a) => a.status === filter.status);
  }
  if (filter.tier && filter.tier !== 'ALL') {
    apps = apps.filter((a) => a.tier === filter.tier);
  }
  if (filter.chapterCode && filter.chapterCode !== 'ALL') {
    apps = apps.filter((a) => a.chapterCode === filter.chapterCode);
  }
  if (filter.pillar && filter.pillar !== 'ALL') {
    apps = apps.filter((a) => a.pillarInterest.includes(filter.pillar as ApplicationPillar));
  }
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    apps = apps.filter(
      (a) =>
        a.reference.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.chapter.toLowerCase().includes(q)
    );
  }

  return apps;
}

/**
 * Get one application by id, respecting RLS.
 * Returns null if not found OR not in the caller's scope.
 */
export function getApplicationById(id: string): Application | null {
  const user = getCurrentUser();
  if (!['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER'].includes(user.role)) {
    return null;
  }

  const app = mockApplications.find((a) => a.id === id);
  if (!app) return null;

  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return null;
    if (app.chapterCode !== user.chapterCode) return null;
  }

  return app;
}

/**
 * Get notes for an application, respecting RLS.
 */
export function getApplicationNotes(applicationId: string): ApplicationNote[] {
  const app = getApplicationById(applicationId);
  if (!app) return [];
  return mockApplicationNotes[applicationId] ?? [];
}

/**
 * Analytics — respects RLS for CHAPTER_LEADER (own chapter), otherwise global.
 */
export function getApplicationAnalytics(): ApplicationAnalytics {
  const user = getCurrentUser();

  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'FINANCE_OFFICER') {
    return mockApplicationAnalytics;
  }

  if (user.role === 'CHAPTER_LEADER' && user.chapterCode) {
    const scoped = mockApplications.filter((a) => a.chapterCode === user.chapterCode);
    const submitted = scoped.filter((a) => a.status !== 'DRAFT');
    const approved = scoped.filter((a) => a.status === 'APPROVED');
    const rejected = scoped.filter((a) => a.status === 'REJECTED');

    return {
      total: scoped.length,
      conversionRate: submitted.length ? approved.length / submitted.length : 0,
      avgTimeToDecisionDays: mockApplicationAnalytics.avgTimeToDecisionDays,
      rejectionRate: submitted.length ? rejected.length / submitted.length : 0,
      funnel: [
        { stage: 'TOTAL', label: 'Submitted', count: submitted.length },
        {
          stage: 'UNDER_REVIEW',
          label: 'Under review',
          count: scoped.filter((a) =>
            [
              'UNDER_REVIEW',
              'INTERVIEW_SCHEDULED',
              'INTERVIEWED',
              'APPROVED',
              'REJECTED',
            ].includes(a.status)
          ).length,
        },
        {
          stage: 'INTERVIEWED',
          label: 'Interviewed',
          count: scoped.filter((a) =>
            ['INTERVIEWED', 'APPROVED', 'REJECTED'].includes(a.status)
          ).length,
        },
        { stage: 'APPROVED', label: 'Approved', count: approved.length },
      ],
      bySource: [
        {
          source: 'Chapter referral',
          count: scoped.filter((a) => a.referralSource === 'Chapter referral').length,
        },
        { source: 'Event', count: scoped.filter((a) => a.referralSource === 'Event').length },
        {
          source: 'Social media',
          count: scoped.filter((a) => a.referralSource === 'Social media').length,
        },
        {
          source: 'Word of mouth',
          count: scoped.filter((a) => a.referralSource === 'Word of mouth').length,
        },
        {
          source: 'Unknown',
          count: scoped.filter((a) => !a.referralSource || a.referralSource === 'Unknown')
            .length,
        },
      ],
      byTier: [
        { tier: 'STUDENT', count: scoped.filter((a) => a.tier === 'STUDENT').length },
        {
          tier: 'PROFESSIONAL',
          count: scoped.filter((a) => a.tier === 'PROFESSIONAL').length,
        },
        { tier: 'ASSOCIATE', count: scoped.filter((a) => a.tier === 'ASSOCIATE').length },
      ],
    };
  }

  // Everyone else: nothing
  return {
    total: 0,
    conversionRate: 0,
    avgTimeToDecisionDays: 0,
    rejectionRate: 0,
    funnel: [],
    bySource: [],
    byTier: [],
  };
}

// ─────────────────────────────────────────────────────────────────
// Permission helpers — used by UI to hide actions the user cannot do
// ─────────────────────────────────────────────────────────────────

export function canViewApplications(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER'].includes(user.role);
}

export function canScheduleInterview(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canRecordOutcome(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canDecideApplication(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canAddNote(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER'].includes(user.role);
}

export function canReverseDecision(): boolean {
  const user = getCurrentUser();
  return user.role === 'SUPER_ADMIN';
}

export function canBulkImport(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canExportApplications(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER'].includes(user.role);
}

export function canViewApplicationAnalytics(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(user.role);
}

// ─────────────────────────────────────────────────────────────────
// Re-exports for convenience
// ─────────────────────────────────────────────────────────────────

export {
  PENDING_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TIER_LABELS,
};

export type {
  Application,
  ApplicationNote,
  ApplicationStatus,
  ApplicationTier,
  ApplicationPillar,
  ApplicationAnalytics,
};
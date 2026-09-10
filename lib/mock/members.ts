// lib/mock/members.ts
'use client';

import {
  mockMembers,
  mockChapters,
  type Member,
} from '@/components/mock/data';
import { getCurrentUser } from './current-user';

// ─────────────────────────────────────────────────────────
// Filter shape
// ─────────────────────────────────────────────────────────

export interface MemberFilter {
  status?: Member['status'] | 'ALL';
  tier?: Member['tier'] | 'ALL';
  chapterCode?: string | 'ALL';
  pillar?: Member['pillarInterest'][number] | 'ALL';
  search?: string;
}

// ─────────────────────────────────────────────────────────
// RLS simulation
// ─────────────────────────────────────────────────────────

/**
 * Simulates server RLS + application-layer authorisation.
 *   - ADMIN, SUPER_ADMIN: all members
 *   - CHAPTER_LEADER:      own chapter only
 *   - FINANCE_OFFICER:     all members (read-only)
 *   - MEMBER, MENTOR, CIRCLE_LEADER: none
 */
export function getMembers(filter: MemberFilter = {}): Member[] {
  const user = getCurrentUser();

  if (
    !['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER', 'FINANCE_OFFICER'].includes(
      user.role
    )
  ) {
    return [];
  }

  let members = [...mockMembers];

  // Simulate RLS: chapter-scoped users see only their chapter
  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return [];
    members = members.filter((m) => m.chapter === user.chapterCode);
  }

  // Apply filters
  if (filter.status && filter.status !== 'ALL') {
    members = members.filter((m) => m.status === filter.status);
  }
  if (filter.tier && filter.tier !== 'ALL') {
    members = members.filter((m) => m.tier === filter.tier);
  }
  if (filter.chapterCode && filter.chapterCode !== 'ALL') {
    members = members.filter((m) => m.chapter === filter.chapterCode);
  }
  if (filter.pillar && filter.pillar !== 'ALL') {
    members = members.filter((m) =>
      m.pillarInterest.includes(filter.pillar as Member['pillarInterest'][number])
    );
  }
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    members = members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q) ||
        getChapterName(m.chapter).toLowerCase().includes(q)
    );
  }

  return members;
}

/**
 * Get one member by id, respecting RLS.
 * Returns null if not found or not in the caller's scope.
 */
export function getMemberById(id: string): Member | null {
  const user = getCurrentUser();
  if (
    !['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER', 'FINANCE_OFFICER'].includes(
      user.role
    )
  ) {
    return null;
  }

  const member = mockMembers.find((m) => m.id === id);
  if (!member) return null;

  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return null;
    if (member.chapter !== user.chapterCode) return null;
  }

  return member;
}

// ─────────────────────────────────────────────────────────
// Chapter code → display name
// ─────────────────────────────────────────────────────────

/**
 * Member.chapter holds a chapter CODE (e.g. 'KU'), not a display name.
 * This resolves to the human-readable name (e.g. 'Kenyatta University').
 * Falls back to the code itself if not found.
 */
export function getChapterName(code: string): string {
  const chapter = mockChapters.find((c) => c.code === code);
  return chapter?.name ?? code;
}

/**
 * List all chapters as { code, name } pairs, for filter dropdowns.
 */
export function getChapterOptions(): { code: string; name: string }[] {
  return mockChapters.map((c) => ({ code: c.code, name: c.name }));
}

// ─────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────

export const MEMBER_TIER_LABELS: Record<Member['tier'], string> = {
  Eagle: 'Eagle',
  Rising: 'Rising',
  Nestling: 'Nestling',
};

export const MEMBER_STATUS_LABELS: Record<Member['status'], string> = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
};

// ─────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────

export function canViewMembers(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'CHAPTER_LEADER', 'FINANCE_OFFICER'].includes(
    user.role
  );
}

export function canEditMember(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canSuspendMember(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canAssignRoles(): boolean {
  const user = getCurrentUser();
  return user.role === 'SUPER_ADMIN';
}

export function canImpersonate(): boolean {
  const user = getCurrentUser();
  return user.role === 'SUPER_ADMIN';
}

export function canMergeMembers(): boolean {
  const user = getCurrentUser();
  return user.role === 'SUPER_ADMIN';
}

export function canExportMembers(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

// Re-exports for convenience
export type { Member };
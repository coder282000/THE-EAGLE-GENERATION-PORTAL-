// lib/mock/chapters.ts
'use client';

import {
  mockChapters,
  mockMembers,
  chapterActivities,
  type Chapter,
  type ChapterActivity,
  type Member,
} from '@/components/mock/data';
import { getCurrentUser } from './current-user';

// ─────────────────────────────────────────────────────────
// Filter shape
// ─────────────────────────────────────────────────────────

export interface ChapterFilter {
  type?: Chapter['type'] | 'ALL';
  region?: string | 'ALL';
  search?: string;
}

// ─────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────

export const CHAPTER_TYPE_LABELS: Record<Chapter['type'], string> = {
  CAMPUS: 'Campus',
  PROFESSIONAL: 'Professional',
};

// ─────────────────────────────────────────────────────────
// RLS simulation
// ─────────────────────────────────────────────────────────

/**
 *   - ADMIN, SUPER_ADMIN, FINANCE_OFFICER: all chapters
 *   - CHAPTER_LEADER: own chapter only
 *   - Others: none
 */
export function getChapters(filter: ChapterFilter = {}): Chapter[] {
  const user = getCurrentUser();
  if (
    !['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
      user.role
    )
  ) {
    return [];
  }

  let chapters = [...mockChapters];

  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return [];
    chapters = chapters.filter((c) => c.code === user.chapterCode);
  }

  if (filter.type && filter.type !== 'ALL') {
    chapters = chapters.filter((c) => c.type === filter.type);
  }
  if (filter.region && filter.region !== 'ALL') {
    chapters = chapters.filter((c) =>
      c.location.toLowerCase().includes(filter.region!.toLowerCase())
    );
  }
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    chapters = chapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.leader?.toLowerCase().includes(q) ?? false)
    );
  }

  return chapters;
}

export function getChapterByCode(code: string): Chapter | null {
  const user = getCurrentUser();
  if (
    !['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
      user.role
    )
  ) {
    return null;
  }

  const chapter = mockChapters.find((c) => c.code === code);
  if (!chapter) return null;

  if (user.role === 'CHAPTER_LEADER') {
    if (!user.chapterCode) return null;
    if (chapter.code !== user.chapterCode) return null;
  }

  return chapter;
}

export function getChapterMembers(code: string): Member[] {
  const chapter = getChapterByCode(code);
  if (!chapter) return [];
  return mockMembers.filter((m) => m.chapter === chapter.code);
}

export function getChapterActivity(code: string): ChapterActivity[] {
  const chapter = getChapterByCode(code);
  if (!chapter) return [];
  return chapterActivities
    .filter((a) => a.chapterCode === chapter.code)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/**
 * Chapters designated as leaders (spec allows multi-leader in future; for now
 * the mock has one leader name on each chapter).
 */
export function getChapterLeaders(code: string): Member[] {
  const chapter = getChapterByCode(code);
  if (!chapter || !chapter.leader) return [];
  return mockMembers.filter(
    (m) => `${m.firstName} ${m.lastName}` === chapter.leader
  );
}

// ─────────────────────────────────────────────────────────
// Derived
// ─────────────────────────────────────────────────────────

export function getRegionOptions(): string[] {
  const regions = Array.from(new Set(mockChapters.map((c) => c.location))).sort();
  return regions;
}

// ─────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────

export function canViewChapters(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
    user.role
  );
}

export function canCreateChapter(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canEditChapter(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canManageLeaders(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canDeleteChapter(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

export function canViewInstitutions(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
    user.role
  );
}

export function canEditInstitutions(): boolean {
  const user = getCurrentUser();
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}

// Re-exports
export type { Chapter, ChapterActivity, Member };
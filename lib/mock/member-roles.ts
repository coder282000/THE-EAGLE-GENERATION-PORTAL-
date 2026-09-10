'use client';

import { getCurrentUser } from './current-user';

export type Role =
  | 'GUEST'
  | 'MEMBER'
  | 'MENTOR'
  | 'CIRCLE_LEADER'
  | 'CHAPTER_LEADER'
  | 'FINANCE_OFFICER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export const ALL_ROLES: Role[] = [
  'GUEST',
  'MEMBER',
  'MENTOR',
  'CIRCLE_LEADER',
  'CHAPTER_LEADER',
  'FINANCE_OFFICER',
  'ADMIN',
  'SUPER_ADMIN',
];

export const ROLE_LABELS: Record<Role, string> = {
  GUEST: 'Guest',
  MEMBER: 'Member',
  MENTOR: 'Mentor',
  CIRCLE_LEADER: 'Circle Leader',
  CHAPTER_LEADER: 'Chapter Leader',
  FINANCE_OFFICER: 'Finance Officer',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  GUEST: 'Unauthenticated visitor. Public site only.',
  MEMBER: 'Vetted, admitted member. Access to the member portal.',
  MENTOR: 'Instructor and/or mentor. Assigned mentees and courses.',
  CIRCLE_LEADER: 'Manages a savings circle (R4 onward).',
  CHAPTER_LEADER: 'Manages a campus or professional chapter.',
  FINANCE_OFFICER: 'Reconciliation, refunds, financial reporting.',
  ADMIN: 'Organisation-wide: membership, content, moderation.',
  SUPER_ADMIN: 'Global: configuration, security, role management.',
};

/**
 * Mock map of memberId -> roles. In production this is a join table
 * `user_role` with the constraint that a user must have at least one role.
 */
const memberRoles: Record<string, Role[]> = {
  '1': ['MEMBER', 'MENTOR', 'CHAPTER_LEADER'],
  '2': ['MEMBER'],
  '3': ['MEMBER', 'MENTOR'],
  '4': ['MEMBER'],
  '5': ['MEMBER', 'CHAPTER_LEADER'],
  '6': ['MEMBER'],
  '7': ['MEMBER', 'MENTOR'],
  '8': ['MEMBER'],
};

export function getMemberRoles(memberId: string): Role[] {
  return memberRoles[memberId] ?? ['MEMBER'];
}

export function canManageRoles(): boolean {
  return getCurrentUser().role === 'SUPER_ADMIN';
}

export function canViewRoles(): boolean {
  const role = getCurrentUser().role;
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}
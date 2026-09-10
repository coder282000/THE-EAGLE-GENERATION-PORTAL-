'use client';

export type SegmentField =
  | 'status'
  | 'tier'
  | 'chapterCode'
  | 'pillarInterest'
  | 'joinedAt';

export type SegmentOperator = 'eq' | 'neq' | 'in' | 'contains' | 'gt' | 'lt';

export interface SegmentRule {
  field: SegmentField;
  operator: SegmentOperator;
  value: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  estimatedCount: number;
}

export const FIELD_LABELS: Record<SegmentField, string> = {
  status: 'Status',
  tier: 'Tier',
  chapterCode: 'Chapter',
  pillarInterest: 'Pillar interest',
  joinedAt: 'Joined date',
};

export const OPERATOR_LABELS: Record<SegmentOperator, string> = {
  eq: 'is',
  neq: 'is not',
  in: 'is one of',
  contains: 'contains',
  gt: 'after',
  lt: 'before',
};

export const mockSegments: Segment[] = [
  {
    id: 'seg-001',
    name: 'Active Eagles',
    description: 'All Eagle-tier members with active status.',
    rules: [
      { field: 'tier', operator: 'eq', value: 'Eagle' },
      { field: 'status', operator: 'eq', value: 'active' },
    ],
    createdBy: 'Solomon A.',
    createdAt: '2026-08-01T10:00:00Z',
    lastUsedAt: '2026-09-05T14:30:00Z',
    estimatedCount: 2,
  },
  {
    id: 'seg-002',
    name: 'Nairobi professionals',
    description: 'Professional chapter members in Nairobi.',
    rules: [
      { field: 'chapterCode', operator: 'eq', value: 'Nairobi Professional' },
    ],
    createdBy: 'Solomon A.',
    createdAt: '2026-08-15T09:00:00Z',
    estimatedCount: 1,
  },
  {
    id: 'seg-003',
    name: 'Governance-focused',
    description: 'Members interested in the Governance pillar.',
    rules: [
      { field: 'pillarInterest', operator: 'contains', value: 'Governance' },
    ],
    createdBy: 'Solomon A.',
    createdAt: '2026-09-01T11:15:00Z',
    estimatedCount: 4,
  },
];

export function canManageSegments(): boolean {
  return true; // No role gate at the mock layer — enforced at page level
}
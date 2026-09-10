// lib/mock/institutions.ts
'use client';

import { getCurrentUser } from './current-user';

export type MOUStatus = 'SIGNED' | 'PENDING' | 'EXPIRED' | 'NONE';

export interface Institution {
  id: string;
  name: string;
  city: string;
  country: string;
  mouStatus: MOUStatus;
  mouSignedAt?: string;
  mouExpiresAt?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

export const MOU_STATUS_LABELS: Record<MOUStatus, string> = {
  SIGNED: 'Signed',
  PENDING: 'Pending',
  EXPIRED: 'Expired',
  NONE: 'None',
};

/**
 * Seed institutions aligned to existing chapter codes:
 * KU, UON, Strathmore, Nairobi Professional, Kisumu.
 */
export const mockInstitutions: Institution[] = [
  {
    id: 'inst-001',
    name: 'Kenyatta University',
    city: 'Nairobi',
    country: 'Kenya',
    mouStatus: 'SIGNED',
    mouSignedAt: '2025-09-01T00:00:00Z',
    mouExpiresAt: '2027-08-31T00:00:00Z',
    contactName: 'Prof. Jane Kamau',
    contactEmail: 'dean@ku.ac.ke',
    notes: 'Flagship campus chapter.',
  },
  {
    id: 'inst-002',
    name: 'University of Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    mouStatus: 'SIGNED',
    mouSignedAt: '2025-11-15T00:00:00Z',
    mouExpiresAt: '2027-11-14T00:00:00Z',
    contactName: 'Dr. Samuel Otieno',
    contactEmail: 'dean@uonbi.ac.ke',
    notes: 'Strong research focus.',
  },
  {
    id: 'inst-003',
    name: 'Strathmore University',
    city: 'Nairobi',
    country: 'Kenya',
    mouStatus: 'SIGNED',
    mouSignedAt: '2026-01-10T00:00:00Z',
    mouExpiresAt: '2028-01-09T00:00:00Z',
    contactName: 'Ms. Alice Wanjiku',
    contactEmail: 'partnerships@strathmore.edu',
    notes: 'Entrepreneurship and innovation hub.',
  },
  {
    id: 'inst-004',
    name: 'Makerere University',
    city: 'Kampala',
    country: 'Uganda',
    mouStatus: 'PENDING',
    contactName: 'Prof. Robert Ssali',
    contactEmail: 'dean@mak.ac.ug',
    notes: 'In discussion for 2026 intake.',
  },
  {
    id: 'inst-005',
    name: 'University of Dar es Salaam',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    mouStatus: 'NONE',
    notes: 'Initial outreach only.',
  },
];

export function getInstitutions(): Institution[] {
  const user = getCurrentUser();
  if (
    !['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
      user.role
    )
  ) {
    return [];
  }
  return mockInstitutions;
}

export function getInstitutionById(id: string): Institution | null {
  const user = getCurrentUser();
  if (
    !['ADMIN', 'SUPER_ADMIN', 'FINANCE_OFFICER', 'CHAPTER_LEADER'].includes(
      user.role
    )
  ) {
    return null;
  }
  return mockInstitutions.find((i) => i.id === id) ?? null;
}

export function getInstitutionsByCountry(): Record<string, Institution[]> {
  return mockInstitutions.reduce<Record<string, Institution[]>>((acc, inst) => {
    if (!acc[inst.country]) acc[inst.country] = [];
    acc[inst.country].push(inst);
    return acc;
  }, {});
}
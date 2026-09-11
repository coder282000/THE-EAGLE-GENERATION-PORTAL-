'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getCampaigns,
  canSendCampaign,
  CAMPAIGN_STATUS_LABELS,
  TEMPLATE_CHANNEL_LABELS,
  type AdminCampaign,
  type CampaignStatus,
} from '@/lib/mock/communications';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { formatCurrency } from '@/lib/utils';

const STATUS_OPTIONS: Array<{ value: CampaignStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENDING', label: 'Sending' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusToBadge(status: CampaignStatus): StatusKey {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'SCHEDULED':
      return 'processing';
    case 'SENDING':
      return 'processing';
    case 'SENT':
      return 'completed';
    case 'PAUSED':
      return 'medium';
    case 'CANCELLED':
      return 'rejected';
  }
}

export default function CampaignsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CampaignStatus | 'ALL'>('ALL');

  const items = useMemo(
    () => getCampaigns(user, { status, q: search }),
    [user, status, search],
  );

  const canCreate = canSendCampaign(user);

  if (!canCreate) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Campaigns are administrator-only.
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Contact a system administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Campaigns</h1>
          <p className="mt-1 text-sm text-ink/60">
            Bulk messages to saved segments.
          </p>
        </div>
        <Link
          href="/admin/notifications/campaigns/new"
          className="inline-flex items-center gap-2 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90 focus:outline-none focus:ring-2 focus:ring-sky/50"
        >
          New campaign
        </Link>
      </header>

      <AdminCard title="All campaigns" subtitle="Review, duplicate or open past sends.">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search by name"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus | 'ALL')}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                search || status !== 'ALL'
                  ? 'No campaigns match these filters.'
                  : 'No campaigns yet.'
              }
              description={
                search || status !== 'ALL'
                  ? 'Try clearing the filters.'
                  : 'Create the first one.'
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">List of campaigns</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Name</th>
                    <th scope="col" className="px-4 py-3">Segment</th>
                    <th scope="col" className="px-4 py-3">Channels</th>
                    <th scope="col" className="px-4 py-3">Recipients</th>
                    <th scope="col" className="px-4 py-3">Cost</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <CampaignRow key={c.id} campaign={c} />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {items.map((c) => (
                <li key={c.id} className="p-4">
                  <CampaignCardMobile campaign={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: AdminCampaign }) {
  const sent = campaign.status === 'SENT';
  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-paper/60">
      <td className="px-4 py-3">
        <Link
          href={`/admin/notifications/campaigns/${campaign.id}`}
          className="font-medium text-ink hover:text-sky"
        >
          {campaign.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-xs">{campaign.segmentName}</td>
      <td className="px-4 py-3 text-xs">
        {campaign.channels.map((ch) => TEMPLATE_CHANNEL_LABELS[ch]).join(', ')}
      </td>
      <td className="px-4 py-3">
        {campaign.recipientCount.toLocaleString()}
        {campaign.excludedCount > 0 && (
          <div className="text-xs text-ink/50">
            {campaign.excludedCount} excluded
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs">
        {campaign.estimatedCostMinor > 0
          ? formatCurrency(campaign.estimatedCostMinor, campaign.currency)
          : 'Free'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={statusToBadge(campaign.status)}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </StatusBadge>
      </td>
      <td className="px-4 py-3 text-xs">
        {sent ? formatDate(campaign.sentAt) : formatDate(campaign.scheduledAt)}
      </td>
    </tr>
  );
}

function CampaignCardMobile({ campaign }: { campaign: AdminCampaign }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/admin/notifications/campaigns/${campaign.id}`}
          className="font-medium text-ink hover:text-sky"
        >
          {campaign.name}
        </Link>
        <StatusBadge status={statusToBadge(campaign.status)}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </StatusBadge>
      </div>
      <div className="text-xs text-ink/60">{campaign.segmentName}</div>
      <div className="text-xs text-ink/60">
        {campaign.recipientCount.toLocaleString()} recipients ·{' '}
        {campaign.channels.map((ch) => TEMPLATE_CHANNEL_LABELS[ch]).join(', ')}
      </div>
    </div>
  );
}
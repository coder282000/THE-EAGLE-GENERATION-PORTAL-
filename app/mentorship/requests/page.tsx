'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { MemberLayout } from '@/components/layout/memberLayout';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Filter,
  User,
} from 'lucide-react';
import { mockMentorshipRequests, mockMembers, MentorshipRequest, Member } from '@/components/mock/data';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'pending' | 'accepted' | 'rejected';

function RequestCard({
  request,
  onAccept,
  onDecline,
  isProcessing,
}: {
  request: MentorshipRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isProcessing: boolean;
}) {
  const mentee = mockMembers.find((m) => m.id === request.menteeId);
  const timeAgo = formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true });
  const initials = mentee ? `${mentee.firstName[0]}${mentee.lastName[0]}` : '??';
  const displayName = mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Unknown Member';

  const statusStyles = {
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3.5 w-3.5" /> },
    ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
    REJECTED: { label: 'Rejected', color: 'bg-clay-100 text-clay-700', icon: <XCircle className="h-3.5 w-3.5" /> },
    COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4" /> },
  };

  const statusInfo = statusStyles[request.status] || statusStyles.PENDING;

  return (
    <Card className="p-5 border border-ink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href={`/profile/${mentee?.id ?? request.menteeId}`} className="shrink-0">
          <Avatar className="h-14 w-14">
            {mentee?.avatar ? (
              <AvatarImage src={mentee.avatar} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-dawn-100 text-dawn-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/profile/${mentee?.id ?? request.menteeId}`}>
                <h3 className="font-display font-semibold text-ink-900 hover:underline">
                  {displayName}
                </h3>
              </Link>
              <p className="text-xs text-ink-400">{mentee?.memberNumber || 'Member'}</p>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Focus: {request.focusArea}
            </span>
            <span>•</span>
            <span>Requested {timeAgo}</span>
          </div>

          <div className="mt-2 p-3 bg-ink-50 rounded-lg">
            <p className="text-sm text-ink-600 italic">"{request.message}"</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {mentee?.pillarInterest.map((pillar) => (
              <span
                key={pillar}
                className="text-[10px] font-medium bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full"
              >
                {pillar}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
          <Link href={`/profile/${mentee?.id ?? request.menteeId}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="h-3.5 w-3.5" /> View Profile
            </Button>
          </Link>
          {request.status === 'PENDING' && (
            <>
              <Button
                variant="primary"
                size="sm"
                className="gap-1"
                onClick={() => onAccept(request.id)}
                disabled={isProcessing}
              >
                <CheckCircle className="h-3.5 w-3.5" /> Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="gap-1"
                onClick={() => onDecline(request.id)}
                disabled={isProcessing}
              >
                <XCircle className="h-3.5 w-3.5" /> Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function RequestInboxPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUserId = '1';

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const userRequests = mockMentorshipRequests.filter(
          (r) => r.mentorId === currentUserId
        );
        setRequests(userRequests);
        setError(null);
      } catch (err) {
        setError('Failed to load requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => r.status.toLowerCase() === filter);
  }, [requests, filter]);

  const counts = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === 'PENDING').length,
      accepted: requests.filter((r) => r.status === 'ACCEPTED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };
  }, [requests]);

  const handleAccept = (requestId: string) => {
    if (!confirm('Accept this mentorship request?')) return;
    setIsProcessing(true);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'ACCEPTED' } : r))
      );
      setIsProcessing(false);
    }, 600);
  };

  const handleDecline = (requestId: string) => {
    if (!confirm('Decline this mentorship request?')) return;
    setIsProcessing(true);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
      );
      setIsProcessing(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Request Inbox</h1>
            <p className="text-sm text-ink-400">Manage your mentorship requests</p>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-14 w-14 rounded-full bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-16 w-full bg-ink-100 animate-pulse rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  if (requests.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Request Inbox</h1>
            <p className="text-sm text-ink-400">Manage your mentorship requests</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-ink-500">Your inbox is empty.</p>
            <p className="text-sm text-ink-400 mt-1">You haven't received any mentorship requests yet.</p>
            <p className="text-xs text-ink-400 mt-1">Make sure your mentor profile is active and visible.</p>
            <Link href="/mentorship/find">
              <Button variant="outline" size="sm" className="mt-4">
                Browse Mentees
              </Button>
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Request Inbox</h1>
            <p className="text-sm text-ink-400">Manage your mentorship requests</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['pending', 'accepted', 'rejected'] as FilterType[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                  filter === key
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {counts[key] > 0 && (
                  <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-ink-500">No {filter} requests.</p>
            <p className="text-sm text-ink-400 mt-1">Try switching to a different filter.</p>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Request Inbox</h1>
          <p className="text-sm text-ink-400">Manage your mentorship requests</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['pending', 'accepted', 'rejected'] as FilterType[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                filter === key
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {counts[key] > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onDecline={handleDecline}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
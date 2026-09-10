'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEventById,
  getEventRegistrations,
  getEventStats,
  canCheckIn,
  checkInByToken,
  checkInByRegistration,
  undoCheckIn,
  searchRegistrations,
  type AdminRegistration,
  type CheckInResult,
  type CheckInOutcome,
} from '@/lib/mock/events';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/button';

const RECENT_LIMIT = 5;

interface RecentEntry {
  registration: AdminRegistration;
  outcome: CheckInOutcome;
  at: number;
}

export default function CheckInPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const eventId = params?.id ?? '';

  const event = eventId ? getEventById(eventId, user) : null;

  const [counter, setCounter] = useState(0);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<AdminRegistration | null>(
    null,
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [offline, setOffline] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<unknown>(null);
  const lastTokenRef = useRef<{ token: string; at: number } | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track online/offline for banner
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Prime the counter from stats
  useEffect(() => {
    if (!event) return;
    const s = getEventStats(event.id);
    setCounter(s.checkedIn);
  }, [event]);

  const handleResult = useCallback(
    (r: CheckInResult) => {
      setResult(r);
      if (r.registration) {
        setRecent((prev) => [
          { registration: r.registration!, outcome: r.outcome, at: Date.now() },
          ...prev,
        ].slice(0, RECENT_LIMIT));
        if (r.outcome === 'VALID') {
          setCounter((c) => c + 1);
        }
      }
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      // Auto-dismiss only on success
      if (r.outcome === 'VALID') {
        resultTimerRef.current = setTimeout(() => setResult(null), 3000);
      }
    },
    [],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  const onToken = useCallback(
    (token: string) => {
      if (!event) return;
      const now = Date.now();
      const last = lastTokenRef.current;
      if (last && last.token === token && now - last.at < 5000) return;
      lastTokenRef.current = { token, at: now };
      const r = checkInByToken(token, event.id);
      handleResult(r);
    },
    [event, handleResult],
  );

  // Attempt to start a BarcodeDetector-based scanner. Falls back to manual.
  const startScanner = useCallback(async () => {
    setCameraError(null);
    if (!event) return;
    try {
      const BarcodeDetectorCtor = (
        window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;

      if (!BarcodeDetectorCtor) {
        setCameraError(
          'Camera scanning is not supported on this browser. Use manual lookup.',
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScannerActive(true);

      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      detectorRef.current = detector;

      const tick = async () => {
        if (!videoRef.current || !detectorRef.current) return;
        try {
          const codes = await (
            detectorRef.current as {
              detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
            }
          ).detect(videoRef.current);
          if (codes.length > 0) onToken(codes[0].rawValue);
        } catch {
          // ignore per-frame errors
        }
        if (scannerActive) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch (e) {
      setCameraError(
        e instanceof Error
          ? `Camera unavailable: ${e.message}`
          : 'Camera unavailable. Use manual lookup.',
      );
    }
  }, [event, onToken, scannerActive]);

  const stopScanner = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    detectorRef.current = null;
    setScannerActive(false);
  }, []);

  if (!event) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">Event not found.</h2>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="mt-4 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to events
        </button>
      </div>
    );
  }

  if (!canCheckIn(user, event)) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You can&apos;t check in for this event.
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Contact support if you believe this is a mistake.
        </p>
      </div>
    );
  }

  const totalConfirmed = getEventRegistrations(event.id, user).filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN',
  ).length;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/admin/events"
          className="text-sm text-ink/60 hover:text-sky"
          aria-label="Back to events"
        >
          ← Back
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-medium text-ink">
            {event.title}
          </div>
          <div
            className="text-xs text-ink/60"
            aria-live="polite"
            aria-atomic="true"
          >
            {counter} of {totalConfirmed} checked in
          </div>
        </div>
        <div className="w-12" aria-hidden="true" />
      </header>

      {offline && (
        <div
          role="status"
          className="rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay"
        >
          Offline — check-ins will queue and sync automatically.
        </div>
      )}

      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-ink/10 bg-ink">
        {scannerActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
            {cameraError ? (
              <p className="text-sm text-white/80">{cameraError}</p>
            ) : (
              <p className="text-sm text-white/80">
                Tap below to start the camera, or use manual lookup.
              </p>
            )}
          </div>
        )}
        {scannerActive && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-3/5 w-3/5 rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!scannerActive ? (
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => void startScanner()}
          >
            Start camera
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={stopScanner}
          >
            Stop camera
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => setLookupOpen(true)}
        >
          Search
        </Button>
      </div>

      {result && result.registration && (
        <ScanResultCard
          result={result}
          onViewDetails={() => setDetailTarget(result.registration ?? null)}
          onDismiss={() => setResult(null)}
        />
      )}

      <section className="space-y-2" aria-label="Recent scans">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Recent
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink/50">No scans yet this session.</p>
        ) : (
          <ul className="divide-y divide-ink/10 rounded-md border border-ink/10 bg-white">
            {recent.map((entry) => (
              <li
                key={`${entry.registration.id}-${entry.at}`}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">
                    {entry.registration.memberName}
                  </div>
                  <div className="text-xs text-ink/50">
                    {new Date(entry.at).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <OutcomeIcon outcome={entry.outcome} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {lookupOpen && (
        <LookupSheet
          eventId={event.id}
          onClose={() => setLookupOpen(false)}
          onSelect={(reg) => {
            setLookupOpen(false);
            const r = checkInByRegistration(reg.id);
            handleResult(r);
          }}
        />
      )}

      {detailTarget && (
        <DetailSheet
          registration={detailTarget}
          onClose={() => setDetailTarget(null)}
          onUndo={(reg) => {
            const ok = undoCheckIn(reg.id);
            if (ok) {
              setCounter((c) => Math.max(0, c - 1));
              setRecent((prev) =>
                prev.filter((e) => e.registration.id !== reg.id),
              );
            }
            setDetailTarget(null);
          }}
          canUndo={detailTarget.status === 'CHECKED_IN'}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------

function ScanResultCard({
  result,
  onViewDetails,
  onDismiss,
}: {
  result: CheckInResult;
  onViewDetails: () => void;
  onDismiss: () => void;
}) {
  const reg = result.registration;
  if (!reg) return null;

  const tone =
    result.outcome === 'VALID'
      ? { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✓', text: 'text-emerald-800' }
      : result.outcome === 'DUPLICATE'
      ? { bg: 'bg-clay/10', border: 'border-clay/30', icon: '!', text: 'text-clay' }
      : { bg: 'bg-rose-50', border: 'border-rose-200', icon: '✕', text: 'text-rose-800' };

  const title = reg.memberName;
  const body =
    result.outcome === 'VALID'
      ? `Checked in ${new Date(reg.checkedInAt ?? Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : result.outcome === 'DUPLICATE'
      ? `Already checked in at ${new Date(reg.checkedInAt ?? Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : result.outcome === 'WRONG_EVENT'
      ? 'This ticket is for another event.'
      : result.outcome === 'CANCELLED'
      ? 'This ticket has been cancelled.'
      : result.outcome === 'PAYMENT_PENDING'
      ? 'Payment for this ticket has not been confirmed.'
      : 'This code is not valid for this event.';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-lg border ${tone.border} ${tone.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold ${tone.text}`}
          aria-hidden="true"
        >
          {tone.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold ${tone.text}`}>{title}</div>
          <div className="mt-0.5 text-xs text-ink/70">{body}</div>
          <div className="mt-2 flex gap-3 text-xs">
            <button
              type="button"
              onClick={onViewDetails}
              className="text-sky hover:underline"
            >
              View details
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-ink/50 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutcomeIcon({ outcome }: { outcome: CheckInOutcome }) {
  const map: Record<CheckInOutcome, { icon: string; cls: string; label: string }> = {
    VALID: { icon: '✓', cls: 'text-emerald-600', label: 'Checked in' },
    DUPLICATE: { icon: '!', cls: 'text-clay', label: 'Duplicate' },
    INVALID: { icon: '✕', cls: 'text-rose-600', label: 'Invalid' },
    WRONG_EVENT: { icon: '✕', cls: 'text-rose-600', label: 'Wrong event' },
    CANCELLED: { icon: '✕', cls: 'text-rose-600', label: 'Cancelled' },
    PAYMENT_PENDING: { icon: '!', cls: 'text-clay', label: 'Payment pending' },
  };
  const m = map[outcome];
  return (
    <span
      className={`text-lg font-bold ${m.cls}`}
      aria-label={m.label}
      title={m.label}
    >
      {m.icon}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lookup sheet
// ---------------------------------------------------------------------------

function LookupSheet({
  eventId,
  onClose,
  onSelect,
}: {
  eventId: string;
  onClose: () => void;
  onSelect: (reg: AdminRegistration) => void;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => (query.trim().length < 2 ? [] : searchRegistrations(query, eventId)),
    [query, eventId],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookup-title"
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-lg bg-white p-6 shadow-xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="lookup-title" className="text-lg font-semibold text-ink">
          Search by name or reference
        </h2>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, email or reference"
          className="mt-3 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
        />

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {query.trim().length < 2 ? (
            <p className="text-sm text-ink/50">
              Type at least 2 characters to search.
            </p>
          ) : results.length === 0 ? (
            <EmptyState
              title="No matching registration."
              description="Check the spelling or scan the QR."
            />
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-ink/10 bg-white p-3 text-left hover:border-sky/40 hover:bg-paper"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {r.memberName}
                  </div>
                  <div className="text-xs text-ink/50">
                    {r.tierName} · {r.reference}
                  </div>
                </div>
                <StatusBadge status={statusToBadge(r.status)}>
                  {r.status === 'CHECKED_IN' ? 'Checked in' : 'Check in'}
                </StatusBadge>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail sheet
// ---------------------------------------------------------------------------

function DetailSheet({
  registration,
  onClose,
  onUndo,
  canUndo,
}: {
  registration: AdminRegistration;
  onClose: () => void;
  onUndo: (reg: AdminRegistration) => void;
  canUndo: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-lg bg-white p-6 shadow-xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="detail-title" className="text-lg font-semibold text-ink">
          {registration.memberName}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Reference" value={registration.reference} />
          <Row label="Tier" value={registration.tierName} />
          <Row label="Chapter" value={registration.memberChapterCode} />
          <Row
            label="Status"
            value={registration.status.replace('_', ' ').toLowerCase()}
          />
          <Row
            label="Checked in at"
            value={
              registration.checkedInAt
                ? new Date(registration.checkedInAt).toLocaleString('en-GB')
                : '—'
            }
          />
        </dl>

        {canUndo && (
          <div className="mt-5 space-y-2 rounded-md border border-clay/30 bg-clay/5 p-3">
            <p className="text-xs text-clay">
              Undo is available when online. This action is recorded in the
              audit log.
            </p>
            {!confirming ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirming(true)}
              >
                Undo check-in
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onUndo(registration)}
                >
                  Confirm undo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function statusToBadge(status: AdminRegistration['status']): StatusKey {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'approved';
    case 'CHECKED_IN':
      return 'active';
    case 'CANCELLED':
      return 'inactive';
    case 'REFUNDED':
      return 'processing';
    case 'NO_SHOW':
      return 'medium';
  }
}
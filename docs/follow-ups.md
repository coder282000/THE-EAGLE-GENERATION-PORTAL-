# Follow-ups

Items deferred from active panels. Each entry has an owner, a trigger for
revisiting, and a rough effort estimate.

---

## Two event shapes to reconcile

`components/mock/data.ts` has a member-facing `Event` type used by
`/events` and `/events/[id]`. `lib/mock/events.ts` has an `AdminEvent`
type used by PNL-08. They should be reconciled when the real backend
arrives — the admin event is the authoritative shape, and the member-
facing view is a projection of it.

Not blocking for R2/R3 build. Flag for the D2.3 database design work.

---

## ADM-093 QR scanner library

Currently uses the browser `BarcodeDetector` API where available
(Chrome/Edge on Android). Not available on Safari or Firefox.

Decision needed before go-live: install `@zxing/browser` or `qr-scanner`
to give complete coverage, or accept that iOS door staff must use
manual lookup.

Effort: 1–2 hours including Storybook story and testing.

---

## ADM-093 offline persistence

The offline check-in queue is in-memory only. On reload, queued
check-ins are lost. Needs localStorage or IndexedDB persistence plus
sync-on-reconnect with idempotency keys before R3 go-live.

Not blocking for the mock UI. Blocking before real event check-in.

Effort: half a day including conflict tests.

---

## ADM-094 insights should be server-generated

Currently generated client-side from the registration payload. When the
real backend lands, insights should be computed server-side so they can
be cached, audited, and made consistent with PNL-17 analytics.

The client-side generator is easy to swap.

---

## ADM-094 funnel — session tracking deferred

Three stages in R3: Registered → Confirmed → Checked in. The fourth
stage (Attended full session) waits on session tracking, which is
flagged as deferred in the ADM-094 spec.

---

## Chapter code display sites

16 sites render raw chapter codes (`KU`, `UON`) instead of resolved
chapter names. `getChapterName()` exists in both `lib/mock/chapters.ts`
and `lib/mock/events.ts`. Migrate the sites when the next pass touches
each file.

Effort: 30 minutes for a careful pass. Defer until the member portal's
chapter name conventions settle.

---

## Duplicated "use client" directive

`app/(admin)/admin/members/page.tsx` had a duplicated `"use client"`
directive (line 1 unquoted, line 2 quoted). Fixed during ADM-030 rebuild.
Kept here as a reminder to watch for the pattern in scaffolded pages.
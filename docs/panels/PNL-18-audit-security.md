# PNL-18 — Audit and Security

**Panel ID:** PNL-18
**Layer:** Layer 3 — Admin Console
**Release:** R1 (audit log), R2 (security events), R3 (access review)
**Gate:** Not gated. Supports every gate: audit log is evidence for G-1 to G-6.
**Screens:** 5 (ADM-220 to ADM-224)
**Status:** Spec baselined, build pending

---

## 1. Purpose

PNL-18 is the memory and the watchtower of the platform. It serves two
functions that are closely related but not identical:

1. **Audit** — an immutable, filterable record of every privileged action
   taken on the platform. Who did what, to which entity, when, and with
   what result. This is the artefact an external auditor or regulator
   asks for first.
2. **Security operations** — a live view of authentication activity,
   privilege changes, active sessions and periodic access reviews.

The audit log itself is write-only from the application's perspective:
no screen in the admin console can edit or delete an entry. This panel
exists to read it. The append-only guarantee is enforced at the database
level by trigger (RO-9, Charter §9.2.1).

---

## 2. Users and permissions

| Role | Scope within PNL-18 |
|---|---|
| ADMIN | Read audit log, security events, sessions, access review; export |
| SUPER_ADMIN | As ADMIN, plus forced logout of any session and access recertification |
| CHAPTER_LEADER | Read audit entries for their chapter's members only |
| FINANCE_OFFICER | Read audit entries for financial entities (transactions, refunds, payouts, ledger) |
| MENTOR | No access |
| MEMBER | No access (member-facing view of own activity is SCR-024 dashboard) |

Helpers in `lib/mock/audit.ts`. The append-only contract is simulated by
the mock — no helper exposes a mutation on `auditLogs`. The real
enforcement is a Postgres trigger in the D2.3 schema.

---

## 3. Workflows

### 3.1 Investigate an incident
1. Security team notices something wrong. Opens ADM-220.
2. Filters by actor + date range.
3. Follows a link to a specific entity to see its full history in ADM-221.
4. Cross-references with ADM-222 (security events) if login anomalies are suspected.
5. Exports the filtered view for the incident file.

### 3.2 Access recertification
1. Quarterly review. Admin opens ADM-224.
2. Reviews who holds which role and when each role was last exercised.
3. Flags stale accounts for removal.
4. Actions are audited and fileable as evidence.

### 3.3 Forced logout
1. A session is suspected of compromise.
2. Admin opens ADM-223.
3. Finds the session by IP, user agent, or member.
4. Forces logout. The action is audited and the session is revoked
   immediately.

### 3.4 Prove an audit claim
1. Auditor asks "was the refund approved by a different user?".
2. Admin opens ADM-220, filters `action = refund.approved`.
3. Selects the relevant entry.
4. Exports the filtered view; the export includes actor, target, before
   and after values, and the four-eyes signature.

---

## 4. Screen inventory

| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-220 | Audit log explorer | `/admin/audit` | P0 |
| ADM-221 | Audit trail for a single entity | `/admin/audit/entity/[type]/[id]` | P0 |
| ADM-222 | Security events | `/admin/security/events` | P1 |
| ADM-223 | Active sessions and forced logout | `/admin/security/sessions` | P1 |
| ADM-224 | Access review | `/admin/security/access-review` | P1 |

---

## 5. Entities

### 5.1 Audit log entry
id bigserial append-only, sequential
actor_id uuid
actor_role text
action text e.g. "application.approved"
entity_type text e.g. "application"
entity_id uuid
before jsonb snapshot before the action
after jsonb snapshot after the action
ip_address inet
user_agent text
created_at timestamptz UTC

### 5.2 Security event
id uuid
type enum LOGIN_FAILED | ACCOUNT_LOCKED |
PRIVILEGE_GRANTED | PRIVILEGE_REVOKED |
SESSION_REVOKED | ANOMALY_DETECTED
severity enum INFO | LOW | MEDIUM | HIGH | CRITICAL
actor_id uuid | null
target_id uuid | null
metadata jsonb
resolved boolean
resolved_by uuid | null
resolved_at timestamptz | null
created_at timestamptz

### 5.3 Session
id uuid
user_id uuid
ip_address inet
user_agent text
started_at timestamptz
last_seen_at timestamptz
expires_at timestamptz
revoked boolean
revoked_by uuid | null
revoked_at timestamptz | null

### 5.4 Access review entry
id uuid
user_id uuid
role text
granted_at timestamptz
granted_by uuid
last_used_at timestamptz | null
review_status enum ACTIVE | PENDING_REVIEW |
CERTIFIED | REVOKE_PENDING | REVOKED
reviewed_by uuid | null
reviewed_at timestamptz | null

---

## 6. Related panels

| Panel | Relationship |
|---|---|
| Every panel | Every privileged action writes an audit entry; PNL-18 reads them all |
| PNL-15 Compliance | Audit entries are the evidence for compliance controls |
| PNL-16 Data Protection | DSR fulfilment and breach events are also audited |
| PNL-01 Dashboard | Links to recent critical security events |

---

## 7. Acceptance criteria

- Every privileged action in the mock data appears in the audit log.
- Filtering by actor, action, entity, date and role works.
- Opening an entity from an audit entry navigates to its full history.
- Exports include before/after values and the four-eyes signature.
- Security events are filterable by severity and resolution state.
- A forced logout takes effect immediately and is audited.
- Access review shows roles, grant dates, last-used dates and review status.
- All five screens implement loading, empty, error, populated and
  permission-denied states.
- Zero P1 defects; WCAG 2.2 AA; responsive at 360/768/1280.
- Audit entries cannot be edited or deleted through any screen.

---

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | What is the retention period for security events? Proposed: 24 months for events, 7 years for audit entries (matches RO-9). | Compliance Lead |
| Q2 | Can an access review revoke a role, or only flag for revocation? Proposed: SUPER_ADMIN can revoke directly; ADMIN only flags. | Compliance Lead |
| Q3 | Are session revocations propagated to the client immediately via WebSocket, or on the next API call? Proposed: immediate via auth provider's session API. | Tech Lead |
| Q4 | Is the audit log exportable as CSV only, or also as a signed JSON for regulatory filing? Proposed: CSV in R1, signed JSON deferred. | Compliance Lead |
| Q5 | Should security events auto-resolve after N days, or remain open until manually resolved? Proposed: manual only. | Tech Lead |
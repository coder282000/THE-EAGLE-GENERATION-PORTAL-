"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { AuditTrail, type AuditEntry } from "@/components/applications/audit-trail";
import {
  getMemberById,
  getChapterName,
  getMemberEnrollments,
  getMemberOrders,
  getMemberTransactions,
  getMemberAuditEntries,
  getCourseById,
  canEditMember,
  canSuspendMember,
  canAssignRoles,
  canImpersonate,
  MEMBER_TIER_LABELS,
  MEMBER_STATUS_LABELS,
  type Member,
} from "@/lib/mock/members";
import {
  ArrowLeft,
  ShieldAlert,
  Pencil,
  UserX,
  UserCheck,
  Shield,
  Eye,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const member = useMemo(
    () => (params.id ? getMemberById(params.id) : null),
    [params.id]
  );

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [suspendBusy, setSuspendBusy] = useState(false);

  if (!member) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Member not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The member does not exist, or you do not have permission to view it.
          </p>
          <div className="mt-6">
            <Link href="/admin/members">
              <Button variant="primary">Back to members</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const enrollments = getMemberEnrollments(member.id);
  const orders = getMemberOrders(member.id);
  const transactions = getMemberTransactions(member.id);
  const auditLogs = getMemberAuditEntries(member);
  const auditEntries: AuditEntry[] = auditLogs.map((a) => ({
    id: a.id,
    actor: a.actor,
    action: a.action.toLowerCase().replace(/_/g, " "),
    target: a.entity,
    timestamp: a.timestamp,
    category: a.action.includes("APPROVED") || a.action.includes("SUSPENDED")
      ? "decision"
      : a.action.includes("UPDATED")
      ? "status"
      : "default",
  }));

  const canEdit = canEditMember();
  const canSuspend = canSuspendMember();
  const canRoles = canAssignRoles();
  const canImpersonateFlag = canImpersonate();

  const handleSuspend = async () => {
    setSuspendError(null);
    if (suspendReason.trim().length < 10) {
      setSuspendError("Reason must be at least 10 characters.");
      return;
    }
    setSuspendBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setSuspendBusy(false);
    setSuspendOpen(false);
    setSuspendReason("");
    // eslint-disable-next-line no-alert
    alert("Member suspended (mock — API not wired).");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Members
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xl font-semibold text-sky-700"
              aria-hidden="true"
            >
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                {member.firstName} {member.lastName}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                <span className="font-mono">{member.memberNumber}</span>
                <span className="mx-2 text-ink-300">·</span>
                {MEMBER_TIER_LABELS[member.tier]}
                <span className="mx-2 text-ink-300">·</span>
                {getChapterName(member.chapter)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={member.status} />
                <TierBadge tier={member.tier} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link href={`/admin/members/${member.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              </Link>
            )}
            {canRoles && (
              <Link href={`/admin/members/${member.id}/roles`}>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                  Roles
                </Button>
              </Link>
            )}
            {canImpersonateFlag && (
              <Button
                variant="outline"
                onClick={() => alert("Impersonation coming soon.")}
              >
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                Impersonate
              </Button>
            )}
            {canSuspend && member.status !== "inactive" && (
              <Button variant="destructive" onClick={() => setSuspendOpen(true)}>
                <UserX className="mr-2 h-4 w-4" aria-hidden="true" />
                Suspend
              </Button>
            )}
            {canSuspend && member.status === "inactive" && (
              <Button variant="success" onClick={() => alert("Reinstate (mock).")}>
                <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Reinstate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chapter">Chapter</TabsTrigger>
          <TabsTrigger value="learning">
            Learning
            {enrollments.length > 0 && <Badge>{enrollments.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="orders">
            Orders
            {orders.length > 0 && <Badge>{orders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="financial">
            Financial
            {transactions.length > 0 && <Badge>{transactions.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="audit">
            Audit
            {auditEntries.length > 0 && <Badge>{auditEntries.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Contact
              </h2>
              <dl className="mt-4 space-y-3">
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={member.email}
                />
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={member.phone}
                />
                <Field
                  icon={<Calendar className="h-4 w-4" />}
                  label="Joined"
                  value={formatDate(member.joinedAt)}
                />
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Pillar interests
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.pillarInterest.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Bio
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">
                {member.bio || (
                  <span className="italic text-ink-400">No bio yet.</span>
                )}
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Chapter */}
        <TabsContent value="chapter">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Current chapter
            </h2>
            <p className="mt-3 text-lg text-ink-900">
              {getChapterName(member.chapter)}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Chapter code: <span className="font-mono">{member.chapter}</span>
            </p>
          </Card>
        </TabsContent>

        {/* Learning */}
        <TabsContent value="learning">
          {enrollments.length === 0 ? (
            <EmptyTab message="No enrolments yet." />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                      Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {enrollments.map((e, i) => {
                    const course = getCourseById(e.courseId);
                    return (
                      <tr key={`${e.courseId}-${i}`}>
                        <td className="px-4 py-3 text-ink-900">
                          {course?.title ?? e.courseId}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                              <div
                                className="h-full bg-sky-500"
                                style={{ width: `${e.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-ink-500">
                              {e.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-ink-600">
                            {e.status.replace("_", " ").toLowerCase()}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-500 sm:table-cell">
                          {formatDate(e.enrolledAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <EmptyTab message="No orders yet." />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Items
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-ink-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-mono text-xs text-ink-500">
                        {o.id}
                      </td>
                      <td className="px-4 py-3 text-ink-900">
                        {o.items.length} item{o.items.length === 1 ? "" : "s"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink-900">
                        {o.currency} {(o.total / 100).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-ink-600">
                          {o.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-ink-500 sm:table-cell">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        {/* Financial */}
        <TabsContent value="financial">
          {transactions.length === 0 ? (
            <EmptyTab message="No transactions yet." />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-ink-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono text-xs text-ink-500">
                        {t.reference}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink-900">
                        {t.currency} {(t.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-600">
                        {t.method}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-ink-600">
                          {t.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-ink-500 sm:table-cell">
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <EmptyTab message="Activity feed coming soon." />
        </TabsContent>

        {/* Audit */}
        <TabsContent value="audit">
          <Card className="p-6">
            {auditEntries.length === 0 ? (
              <p className="text-sm text-ink-500">
                No audit entries for this member.
              </p>
            ) : (
              <AuditTrail entries={auditEntries} defaultVisible={10} />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend modal */}
      {suspendOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suspend-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-50">
                <ShieldAlert className="h-5 w-5 text-clay-700" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="suspend-title"
                  className="text-lg font-semibold text-ink-900"
                >
                  Suspend member?
                </h2>
                <p className="mt-2 text-sm text-ink-600">
                  <strong>
                    {member.firstName} {member.lastName}
                  </strong>{" "}
                  will be denied at the API, not just in the UI. They cannot log
                  in until reinstated.
                </p>
              </div>
            </div>

            <label
              htmlFor="suspend-reason"
              className="mt-5 block text-sm font-medium text-ink-700"
            >
              Reason <span className="text-clay-600">*</span>
            </label>
            <textarea
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Recorded in the audit log and shared with the member."
              aria-invalid={!!suspendError}
              aria-describedby={suspendError ? "suspend-error" : undefined}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {suspendError && (
              <p id="suspend-error" className="mt-2 text-sm text-red-600">
                {suspendError}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                variant="destructive"
                fullWidth
                onClick={handleSuspend}
                disabled={suspendBusy}
              >
                {suspendBusy ? "Suspending…" : "Confirm suspension"}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSuspendOpen(false);
                  setSuspendReason("");
                  setSuspendError(null);
                }}
                disabled={suspendBusy}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-ink-400">{icon}</div>
      <div className="min-w-0">
        <dt className="text-xs text-ink-500">{label}</dt>
        <dd className="text-sm text-ink-900 break-all">{value}</dd>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Member["status"] }) {
  const styles: Record<Member["status"], string> = {
    active: "bg-green-50 text-green-700",
    pending: "bg-dawn-50 text-dawn-700",
    inactive: "bg-ink-100 text-ink-500",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {MEMBER_STATUS_LABELS[status]}
    </span>
  );
}

function TierBadge({ tier }: { tier: Member["tier"] }) {
  return (
    <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
      {MEMBER_TIER_LABELS[tier]}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink-100 px-1.5 text-[10px] font-semibold text-ink-600">
      {children}
    </span>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-ink-500">{message}</p>
    </Card>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
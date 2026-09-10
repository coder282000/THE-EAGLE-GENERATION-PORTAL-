"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getMemberById,
  MEMBER_TIER_LABELS,
} from "@/lib/mock/members";
import {
  getMemberRoles,
  canManageRoles,
  canViewRoles,
  ALL_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type Role,
} from "@/lib/mock/member-roles";
import { ArrowLeft, ShieldAlert, Check, X, Info } from "lucide-react";

export default function MemberRolesPage() {
  const params = useParams<{ id: string }>();
  const member = params.id ? getMemberById(params.id) : null;
  const [roles, setRoles] = useState<Role[]>(() =>
    params.id ? getMemberRoles(params.id) : []
  );
  const [confirm, setConfirm] = useState<{
    action: "assign" | "revoke";
    role: Role;
  } | null>(null);
  const [busy, setBusy] = useState(false);

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

  if (!canViewRoles()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            Only Admins and Super Admins can view role assignments.
          </p>
          <div className="mt-6">
            <Link href={`/admin/members/${member.id}`}>
              <Button variant="primary">Back to member</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const canManage = canManageRoles();
  const availableRoles = ALL_ROLES.filter((r) => !roles.includes(r));

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    if (confirm.action === "assign") {
      setRoles((prev) => [...prev, confirm.role]);
    } else {
      setRoles((prev) => prev.filter((r) => r !== confirm.role));
    }
    setBusy(false);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/members/${member.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to member
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Roles
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {member.firstName} {member.lastName} ·{" "}
          <span className="font-mono">{member.memberNumber}</span> ·{" "}
          {MEMBER_TIER_LABELS[member.tier]}
        </p>
      </div>

      {/* Warning */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-ink-600">
            Role changes take effect on the next request. Privileged roles
            require MFA and will be prompted to re-authenticate.
          </p>
        </div>
      </Card>

      {/* Current roles */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Current roles ({roles.length})
        </h2>
        {roles.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">
            This member has no roles. (This should not happen — every user needs
            at least MEMBER.)
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-50">
            {roles.map((r) => (
              <li key={r} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{ROLE_LABELS[r]}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {ROLE_DESCRIPTIONS[r]}
                  </p>
                </div>
                {canManage && roles.length > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setConfirm({ action: "revoke", role: r })}
                    aria-label={`Revoke ${ROLE_LABELS[r]}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Available roles */}
      {canManage && availableRoles.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
            Available roles ({availableRoles.length})
          </h2>
          <ul className="mt-4 divide-y divide-ink-50">
            {availableRoles.map((r) => (
              <li key={r} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{ROLE_LABELS[r]}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {ROLE_DESCRIPTIONS[r]}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setConfirm({ action: "assign", role: r })}
                >
                  <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                  Assign
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm
            ? confirm.action === "assign"
              ? `Assign ${ROLE_LABELS[confirm.role]}?`
              : `Revoke ${ROLE_LABELS[confirm.role]}?`
            : ""
        }
        description={
          confirm
            ? confirm.action === "assign"
              ? `The member will gain the ${ROLE_LABELS[confirm.role]} role on next request.`
              : `The member will lose the ${ROLE_LABELS[confirm.role]} role on next request.`
            : ""
        }
        confirmLabel={confirm?.action === "assign" ? "Assign" : "Revoke"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getChapterByCode,
  getChapterLeaders,
  canManageLeaders,
} from "@/lib/mock/chapters";
import { getMembers, MEMBER_TIER_LABELS, type Member } from "@/lib/mock/members";
import { ArrowLeft, ShieldAlert, Plus, X, Crown } from "lucide-react";

export default function ChapterLeadersPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ? decodeURIComponent(params.code) : null;
  const chapter = useMemo(() => (code ? getChapterByCode(code) : null), [code]);
  const [extraLeaders, setExtraLeaders] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);

  if (!chapter) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Chapter not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The chapter does not exist, or you do not have permission to view it.
          </p>
          <div className="mt-6">
            <Link href="/admin/chapters">
              <Button variant="primary">Back to chapters</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!canManageLeaders()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to assign chapter leaders.
          </p>
          <div className="mt-6">
            <Link href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}>
              <Button variant="primary">Back to chapter</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Leaders = base (from chapter.leader) + added in this session
  const baseLeaders = getChapterLeaders(chapter.code);
  const leaders = [...baseLeaders, ...extraLeaders.filter((l) => !baseLeaders.some((b) => b.id === l.id))];

  const allMembers = getMembers({});

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const excludedIds = new Set(leaders.map((l) => l.id));
    return allMembers.filter((m) => {
      if (excludedIds.has(m.id)) return false;
      if (m.status !== "active") return false;
      if (!q) return true;
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMembers, leaders, search]);

  const handleAdd = (member: Member) => {
    setExtraLeaders((prev) => [...prev, member]);
    setSearch("");
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 350));
    setExtraLeaders((prev) => prev.filter((l) => l.id !== removeTarget.id));
    setBusy(false);
    setRemoveTarget(null);
  };

  const removingLastLeader = leaders.length === 1 && removeTarget !== null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to chapter
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Chapter leaders
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {chapter.name} · <span className="font-mono">{chapter.code}</span>
        </p>
      </div>

      {/* Warning when no leaders remain */}
      {leaders.length === 0 && (
        <Card className="p-4">
          <div className="flex items-start gap-3 rounded-md border border-clay-200 bg-clay-50 p-3 text-sm text-clay-800">
            <Crown className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">No leaders assigned</p>
              <p className="mt-0.5 text-clay-700">
                Assign at least one leader so this chapter has an owner. Members
                gain the CHAPTER_LEADER role on next request.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Current leaders */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Current leaders ({leaders.length})
        </h2>
        {leaders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">
            No leaders assigned yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-50">
            {leaders.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700"
                    aria-hidden="true"
                  >
                    {l.firstName[0]}
                    {l.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">
                      {l.firstName} {l.lastName}
                    </p>
                    <p className="text-xs text-ink-500">
                      <span className="font-mono">{l.memberNumber}</span> ·{" "}
                      {MEMBER_TIER_LABELS[l.tier]}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setRemoveTarget(l)}
                  aria-label={`Remove ${l.firstName} ${l.lastName} as leader`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add leader */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Add a leader
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Only active members of any chapter can be assigned. Search by name,
          member number or email.
        </p>
        <div className="mt-3">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search members…"
            aria-label="Search for a member to assign"
          />
        </div>

        {search.trim() && (
          <ul
            aria-live="polite"
            className="mt-3 max-h-64 overflow-y-auto divide-y divide-ink-50 rounded-md border border-ink-100"
          >
            {candidates.length === 0 ? (
              <li className="py-6 text-center text-sm text-ink-400">
                No matching active members.
              </li>
            ) : (
              candidates.slice(0, 20).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-ink-500">
                      <span className="font-mono">{m.memberNumber}</span> ·{" "}
                      {m.email}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => handleAdd(m)}>
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add
                  </Button>
                </li>
              ))
            )}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={
          removeTarget
            ? `Remove ${removeTarget.firstName} ${removeTarget.lastName}?`
            : ""
        }
        description={
          removeTarget
            ? removingLastLeader
              ? "This is the last leader. Removing them leaves the chapter unmanaged. The member will lose the CHAPTER_LEADER role on next request."
              : "The member will lose the CHAPTER_LEADER role on next request."
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleRemoveConfirm}
      />
    </div>
  );
}
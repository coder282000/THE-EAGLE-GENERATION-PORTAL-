"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getGroups,
  canViewModeration,
  canActionModeration,
  isChapterLeaderScoped,
  GROUP_TYPE_LABELS,
  GROUP_VISIBILITY_LABELS,
  GROUP_STATUS_LABELS,
  type Group,
  type GroupStatus,
} from "@/lib/mock/moderation";

const STATUS_TONE: Record<GroupStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  WATCHED: "bg-clay/15 text-clay",
  ARCHIVED: "bg-ink/10 text-ink/70",
  DELETED: "bg-red-100 text-red-800",
};

type ActionKey = null | "archive" | "flag" | "transfer" | "delete";

function healthOf(g: Group): "healthy" | "watched" | "at-risk" {
  if (g.status === "ARCHIVED" || g.status === "DELETED") return "watched";
  if (g.reports30d >= 3) return "at-risk";
  if (g.reports30d >= 1) return "watched";
  return "healthy";
}

export default function GroupManagementPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewModeration();
  const canAction = canActionModeration();
  const scoped = isChapterLeaderScoped();
  const all = useMemo(() => getGroups(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((g) => g.type === typeFilter);
    if (visibilityFilter !== "all") r = r.filter((g) => g.visibility === visibilityFilter);
    if (statusFilter !== "all") r = r.filter((g) => g.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((g) => g.name.toLowerCase().includes(q) || g.ownerName.toLowerCase().includes(q));
    }
    return r;
  }, [all, search, typeFilter, visibilityFilter, statusFilter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view this panel.
        </div>
      </div>
    );
  }

  const stats = {
    total: all.length,
    active: all.filter((g) => g.status === "ACTIVE").length,
    flagged: all.filter((g) => g.status === "WATCHED").length,
    archived: all.filter((g) => g.status === "ARCHIVED").length,
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Group management</h1>
        <p className="mt-1 text-sm text-ink/60">Oversight for every community group.</p>
      </header>

      {scoped && (
        <div className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Own-chapter scope: you see only groups belonging to your chapter. Archive and delete are not available.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total groups" value={stats.total} />
        <Kpi label="Active" value={stats.active} tone="success" />
        <Kpi label="Flagged" value={stats.flagged} tone="clay" />
        <Kpi label="Archived" value={stats.archived} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or owner"
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search groups"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by type">
            <option value="all">All types</option>
            {Object.entries(GROUP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by visibility">
            <option value="all">All visibilities</option>
            {Object.entries(GROUP_VISIBILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {Object.entries(GROUP_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {canAction && selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-ink/10 bg-sky/5 p-3 text-sm">
            <span className="font-medium text-ink">{selected.size} selected</span>
            <Button variant="outline" onClick={() => setAction("archive")}>Archive</Button>
            <Button variant="outline" onClick={() => setAction("flag")}>Flag for review</Button>
            <Button variant="outline" onClick={() => setAction("transfer")}>Transfer ownership</Button>
            <Button variant="destructive" onClick={() => setAction("delete")}>Delete</Button>
            <Button variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">No groups found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Community groups</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2 w-8"></th>
                  <th scope="col" className="px-4 py-2">Name</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Visibility</th>
                  <th scope="col" className="px-4 py-2">Owner</th>
                  <th scope="col" className="px-4 py-2">Members</th>
                  <th scope="col" className="px-4 py-2">Reports (30d)</th>
                  <th scope="col" className="px-4 py-2">Last activity</th>
                  <th scope="col" className="px-4 py-2">Health</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((g) => {
                  const health = healthOf(g);
                  const healthLabel = health === "healthy" ? "Healthy" : health === "watched" ? "Watched" : "At risk";
                  const healthTone = health === "healthy" ? "text-green-700" : health === "watched" ? "text-clay" : "text-red-600";
                  const deletable = !scoped;
                  return (
                    <tr key={g.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">
                        {canAction && (
                          <input
                            type="checkbox"
                            checked={selected.has(g.id)}
                            onChange={() => toggle(g.id)}
                            aria-label={`Select ${g.name}`}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{g.name}</td>
                      <td className="px-4 py-3">{GROUP_TYPE_LABELS[g.type]}</td>
                      <td className="px-4 py-3">{GROUP_VISIBILITY_LABELS[g.visibility]}</td>
                      <td className="px-4 py-3">{g.ownerName}</td>
                      <td className="px-4 py-3">{g.memberCount}</td>
                      <td className={"px-4 py-3 " + (g.reports30d > 0 ? "text-clay" : "")}>{g.reports30d}</td>
                      <td className="px-4 py-3 text-ink/70">{new Date(g.lastActivityAt).toLocaleDateString("en-GB")}</td>
                      <td className={"px-4 py-3 " + healthTone}>{healthLabel}</td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[g.status]}>
                          {GROUP_STATUS_LABELS[g.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {action && (
        <ActionDialog
          action={action}
          count={selected.size}
          onClose={() => { setAction(null); setSelected(new Set()); }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "clay" | "danger" | "success" }) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}

function ActionDialog({
  action,
  count,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  count: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    archive: `Archive ${count} group${count === 1 ? "" : "s"}?`,
    flag: `Flag ${count} group${count === 1 ? "" : "s"} for review?`,
    transfer: `Transfer ownership of ${count} group${count === 1 ? "" : "s"}?`,
    delete: `Delete ${count} group${count === 1 ? "" : "s"}?`,
  };
  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    archive: "Members keep their history. The group becomes read-only. A reason is required.",
    flag: "Flagged for internal review. No member is notified.",
    transfer: "Select a new owner from the group members. All actions are audited.",
    delete: "Soft delete. History is retained. Type DELETE to confirm.",
  };
  const needReason = (action === "archive" || action === "flag") && reason.trim().length < 10;
  const needTyped = action === "delete" && typed !== "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {(action === "archive" || action === "flag") && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" />
          </div>
        )}

        {action === "delete" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Type DELETE to confirm</label>
            <input value={typed} onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "delete" ? "destructive" : "primary"}
            disabled={needReason || needTyped}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
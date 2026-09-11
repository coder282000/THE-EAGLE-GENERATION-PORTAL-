"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getBans,
  getBlocks,
  canViewModeration,
  canActionModeration,
  canMakeBanPermanent,
  BAN_DURATION_LABELS,
  BAN_STATUS_LABELS,
  APPEAL_STATUS_LABELS,
  type BanRecord,
  type BanStatus,
  type AppealStatus,
} from "@/lib/mock/moderation";

const BAN_STATUS_TONE: Record<BanStatus, string> = {
  ACTIVE: "bg-red-100 text-red-800",
  EXPIRED: "bg-ink/10 text-ink/70",
  REVOKED: "bg-green-100 text-green-800",
};

const APPEAL_TONE: Record<AppealStatus, string> = {
  NONE: "text-ink/50",
  PENDING: "text-clay",
  UPHELD: "text-red-600",
  DENIED: "text-ink/70",
};

type ActionKey = null | "revoke" | "extend" | "permanent";
type Tab = "blocks" | "bans";

export default function BlockedBannedPage() {
  const [tab, setTab] = useState<Tab>("blocks");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [action, setAction] = useState<ActionKey>(null);
  const [selectedBanId, setSelectedBanId] = useState<string | null>(null);

  const canView = canViewModeration();
  const canAct = canActionModeration();
  const canPermanent = canMakeBanPermanent();
  const bans = useMemo(() => getBans(), []);
  const blocks = useMemo(() => getBlocks(), []);

  const filteredBans = useMemo(() => {
    let r = bans;
    if (statusFilter !== "all") r = r.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (b) =>
          b.memberName.toLowerCase().includes(q) ||
          b.memberNumber.toLowerCase().includes(q) ||
          b.reasonCategory.toLowerCase().includes(q)
      );
    }
    return r;
  }, [bans, search, statusFilter]);

  const filteredBlocks = useMemo(() => {
    let r = blocks;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (b) => b.blockerName.toLowerCase().includes(q) || b.blockedName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [blocks, search]);

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
    activeBlocks: blocks.filter((b) => b.active).length,
    activeBans: bans.filter((b) => b.status === "ACTIVE").length,
    expiringSoon: bans.filter((b) => {
      if (b.status !== "ACTIVE" || !b.expiresAt) return false;
      const days = (new Date(b.expiresAt).getTime() - Date.now()) / 86400000;
      return days >= 0 && days <= 7;
    }).length,
    appealsPending: bans.filter((b) => b.appealStatus === "PENDING").length,
  };

  const selectedBan = selectedBanId ? bans.find((b) => b.id === selectedBanId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Blocked and banned register</h1>
        <p className="mt-1 text-sm text-ink/60">
          Every block and ban in force, with the record behind each decision.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Active blocks" value={stats.activeBlocks} />
        <Kpi label="Active bans" value={stats.activeBans} tone={stats.activeBans > 0 ? "clay" : "ink"} />
        <Kpi label="Bans expiring (7d)" value={stats.expiringSoon} tone="clay" />
        <Kpi label="Appeals pending" value={stats.appealsPending} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div role="tablist" className="flex border-b border-ink/10">
          <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}>
            Blocks ({blocks.length})
          </TabButton>
          <TabButton active={tab === "bans"} onClick={() => setTab("bans")}>
            Bans ({bans.length})
          </TabButton>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "bans" ? "Search member or reason" : "Search blocker or blocked"}
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search"
          />
          {tab === "bans" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.entries(BAN_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </div>

        {tab === "blocks" && (
          <div className="overflow-x-auto">
            {filteredBlocks.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/60">No active blocks.</div>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Blocks</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Blocker</th>
                    <th scope="col" className="px-4 py-2">Blocked</th>
                    <th scope="col" className="px-4 py-2">Since</th>
                    <th scope="col" className="px-4 py-2">Source</th>
                    <th scope="col" className="px-4 py-2">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filteredBlocks.map((b) => (
                    <tr key={b.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">{b.blockerName}</td>
                      <td className="px-4 py-3">{b.blockedName}</td>
                      <td className="px-4 py-3 text-ink/70">{new Date(b.since).toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3 text-ink/70">{b.source === "SELF" ? "Self" : "Report action"}</td>
                      <td className="px-4 py-3">{b.active ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "bans" && (
          <div className="overflow-x-auto">
            {filteredBans.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/60">No active bans.</div>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Bans</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Member</th>
                    <th scope="col" className="px-4 py-2">Member no.</th>
                    <th scope="col" className="px-4 py-2">Reason</th>
                    <th scope="col" className="px-4 py-2">Duration</th>
                    <th scope="col" className="px-4 py-2">Issued by</th>
                    <th scope="col" className="px-4 py-2">Issued</th>
                    <th scope="col" className="px-4 py-2">Expires</th>
                    <th scope="col" className="px-4 py-2">Appeal</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    {canAct && <th scope="col" className="px-4 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filteredBans.map((b) => (
                    <tr key={b.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">{b.memberName}</td>
                      <td className="px-4 py-3 text-ink/70">{b.memberNumber}</td>
                      <td className="px-4 py-3">{b.reasonCategory}</td>
                      <td className="px-4 py-3">{BAN_DURATION_LABELS[b.duration]}</td>
                      <td className="px-4 py-3 text-ink/70">{b.issuedBy}</td>
                      <td className="px-4 py-3 text-ink/70">{new Date(b.issuedAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {b.expiresAt ? new Date(b.expiresAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className={"px-4 py-3 " + APPEAL_TONE[b.appealStatus]}>
                        {APPEAL_STATUS_LABELS[b.appealStatus]}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + BAN_STATUS_TONE[b.status]}>
                          {BAN_STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      {canAct && (
                        <td className="px-4 py-3">
                          {b.status === "ACTIVE" && (
                            <div className="flex gap-1">
                              <Button variant="outline" onClick={() => { setSelectedBanId(b.id); setAction("revoke"); }}>
                                Revoke
                              </Button>
                              <Button variant="outline" onClick={() => { setSelectedBanId(b.id); setAction("extend"); }}>
                                Extend
                              </Button>
                              {canPermanent && b.duration !== "PERMANENT" && (
                                <Button variant="destructive" onClick={() => { setSelectedBanId(b.id); setAction("permanent"); }}>
                                  Permanent
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {action && selectedBan && (
        <ActionDialog
          action={action}
          ban={selectedBan}
          onClose={() => { setAction(null); setSelectedBanId(null); }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-4 py-2 text-sm " +
        (active ? "border-sky text-sky" : "border-transparent text-ink/60 hover:text-ink")
      }
    >
      {children}
    </button>
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
  ban,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  ban: BanRecord;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    revoke: `Revoke ban on ${ban.memberName}?`,
    extend: `Extend ban on ${ban.memberName}?`,
    permanent: `Make ban on ${ban.memberName} permanent?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    revoke: "The member is reinstated immediately. A reason is required and audited.",
    extend: "Choose a new duration. The member is notified. Recorded in the register.",
    permanent: "Type the member number to confirm. This is audited and cannot be reversed except by another SUPER_ADMIN action.",
  };

  const needReason = action === "revoke" && reason.trim().length < 20;
  const needTyped = action === "permanent" && typed.trim() !== ban.memberNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "revoke" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Reason (min 20 chars)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {action === "extend" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">New duration</label>
            <select className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
              {Object.entries(BAN_DURATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}

        {action === "permanent" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Type {ban.memberNumber} to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "permanent" ? "destructive" : "primary"}
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
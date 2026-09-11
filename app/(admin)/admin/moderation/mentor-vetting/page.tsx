"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getMentorApplications,
  canViewModeration,
  canVetMentor,
  FOCUS_CATEGORY_LABELS,
  VETTING_STAGE_LABELS,
  CHECK_STATUS_LABELS,
  VETTING_STATUS_LABELS,
  type MentorApplication,
  type VettingStage,
  type CheckStatus,
} from "@/lib/mock/moderation";

const STAGE_ORDER: VettingStage[] = ["SUBMITTED", "BACKGROUND_CHECK", "CODE_OF_CONDUCT", "DECISION"];

const CHECK_TONE: Record<CheckStatus, string> = {
  NOT_STARTED: "text-ink/50",
  IN_PROGRESS: "text-clay",
  CLEAR: "text-green-700",
  ADVERSE: "text-red-600",
  INCONCLUSIVE: "text-clay",
};

type ActionKey = null | "approve" | "reject" | "startCheck" | "requestInfo";

export default function MentorVettingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [action, setAction] = useState<ActionKey>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canView = canViewModeration();
  const canAct = canVetMentor();
  const all = useMemo(() => getMentorApplications(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((a) => a.status === statusFilter);
    if (stageFilter !== "all") r = r.filter((a) => a.stage === stageFilter);
    if (categoryFilter !== "all") r = r.filter((a) => a.focusCategories.includes(categoryFilter as any));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (a) =>
          a.reference.toLowerCase().includes(q) ||
          a.userName.toLowerCase().includes(q) ||
          a.memberNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter, stageFilter, categoryFilter]);

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
    pending: all.filter((a) => a.status === "PENDING").length,
    inReview: all.filter((a) => a.status === "PENDING" && a.stage !== "DECISION").length,
    approved: all.filter((a) => a.status === "APPROVED").length,
    rejected: all.filter((a) => a.status === "REJECTED").length,
  };

  const selectedApp = selectedId ? all.find((a) => a.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Mentor vetting</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approve mentors only after background checks and code-of-conduct acceptance.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Pending" value={stats.pending} />
        <Kpi label="In review" value={stats.inReview} tone="clay" />
        <Kpi label="Approved (30d)" value={stats.approved} tone="success" />
        <Kpi label="Rejected (30d)" value={stats.rejected} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, name, member no."
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search applications"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {Object.entries(VETTING_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by stage">
            <option value="all">All stages</option>
            {Object.entries(VETTING_STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by focus category">
            <option value="all">All categories</option>
            {Object.entries(FOCUS_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">No mentors awaiting vetting.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Mentor applications</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Applicant</th>
                  <th scope="col" className="px-4 py-2">Member no.</th>
                  <th scope="col" className="px-4 py-2">Focus categories</th>
                  <th scope="col" className="px-4 py-2">Submitted</th>
                  <th scope="col" className="px-4 py-2">Stage</th>
                  <th scope="col" className="px-4 py-2">Background check</th>
                  <th scope="col" className="px-4 py-2">CoC</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                  <th scope="col" className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((a) => {
                  const canApprove = a.backgroundCheck === "CLEAR" && a.codeAccepted && a.status === "PENDING";
                  const stageIdx = STAGE_ORDER.indexOf(a.stage);
                  return (
                    <tr key={a.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3 font-medium text-ink">{a.reference}</td>
                      <td className="px-4 py-3">{a.userName}</td>
                      <td className="px-4 py-3 text-ink/70">{a.memberNumber}</td>
                      <td className="px-4 py-3">
                        {a.focusCategories.map((f) => (
                          <span key={f} className="mr-1 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-xs">
                            {FOCUS_CATEGORY_LABELS[f]}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-ink/70">{new Date(a.submittedAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs">
                          {STAGE_ORDER.map((s, i) => (
                            <span key={s} className={"h-1.5 w-6 rounded-full " + (i <= stageIdx ? "bg-sky" : "bg-ink/10")} />
                          ))}
                          <span className="ml-2 text-ink/70">{VETTING_STAGE_LABELS[a.stage]}</span>
                        </div>
                      </td>
                      <td className={"px-4 py-3 " + CHECK_TONE[a.backgroundCheck]}>
                        {CHECK_STATUS_LABELS[a.backgroundCheck]}
                      </td>
                      <td className="px-4 py-3">
                        {a.codeAccepted ? <span className="text-green-700">Accepted</span> : <span className="text-clay">Pending</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                          {VETTING_STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canAct && a.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button variant="outline" onClick={() => { setSelectedId(a.id); setAction("startCheck"); }}>
                              Start check
                            </Button>
                            <Button
                              variant="primary"
                              disabled={!canApprove}
                              title={canApprove ? "Approve mentor" : "Requires CLEAR background check and code-of-conduct acceptance"}
                              onClick={() => { setSelectedId(a.id); setAction("approve"); }}
                            >
                              Approve
                            </Button>
                            <Button variant="destructive" onClick={() => { setSelectedId(a.id); setAction("reject"); }}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {action && selectedApp && (
        <ActionDialog
          action={action}
          application={selectedApp}
          onClose={() => { setAction(null); setSelectedId(null); }}
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
  application,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  application: MentorApplication;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const titles: Record<Exclude<ActionKey, null>, string> = {
    approve: `Approve ${application.userName} as a mentor?`,
    reject: `Reject ${application.reference}?`,
    startCheck: `Start background check for ${application.userName}?`,
    requestInfo: `Request more information from ${application.userName}?`,
  };
  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    approve: "The MENTOR role is granted and the applicant is notified. This is audited.",
    reject: "The applicant is notified without the internal reason. Reason required (min 20 characters).",
    startCheck: "This initiates a background check with the selected provider. The applicant will not be notified.",
    requestInfo: "Sends an in-app request for additional information. No member is notified outside the applicant.",
  };
  const needReason = action === "reject" && reason.trim().length < 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "reject" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Reason (min 20 chars)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "reject" ? "destructive" : "primary"}
            disabled={needReason}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
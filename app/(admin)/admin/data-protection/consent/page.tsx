"use client";

import { useMemo, useState } from "react";
import {
  getConsents, getConsentVersions, canViewDataProtection,
  CONSENT_PURPOSE_LABELS, CONSENT_STATUS_LABELS,
} from "@/lib/mock/data-protection";

export default function ConsentRegisterPage() {
  const [tab, setTab] = useState<"members" | "versions">("members");
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");

  const canView = canViewDataProtection();
  const consents = useMemo(() => getConsents(), []);
  const versions = useMemo(() => getConsentVersions(), []);

  const filtered = useMemo(() => {
    let r = consents;
    if (purposeFilter !== "all") r = r.filter((c) => c.purpose === purposeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.memberName.toLowerCase().includes(q) || c.memberNumber.toLowerCase().includes(q));
    }
    return r;
  }, [consents, search, purposeFilter]);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const granted = consents.filter((c) => c.status === "GRANTED").length;
  const withdrawn = consents.filter((c) => c.status === "WITHDRAWN").length;
  const pending = consents.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Consent register</h1>
        <p className="mt-1 text-sm text-ink/60">
          Versioned consent per purpose. Re-consent triggers on material change (DPA-1, DPA-2).
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Granted" value={granted} tone="success" />
        <Kpi label="Withdrawn" value={withdrawn} />
        <Kpi label="Pending" value={pending} tone="clay" />
        <Kpi label="Versions" value={versions.length} />
      </div>

      <div className="flex gap-2 border-b border-ink/10">
        <TabBtn active={tab === "members"} onClick={() => setTab("members")}>By member</TabBtn>
        <TabBtn active={tab === "versions"} onClick={() => setTab("versions")}>Version history</TabBtn>
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        {tab === "members" && (
          <>
            <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or member no."
                className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              />
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All purposes</option>
                {Object.entries(CONSENT_PURPOSE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/60">No consent records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-2">Member</th>
                      <th className="px-4 py-2">Member no.</th>
                      <th className="px-4 py-2">Purpose</th>
                      <th className="px-4 py-2">Version</th>
                      <th className="px-4 py-2">Granted</th>
                      <th className="px-4 py-2">Withdrawn</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-ink/5">
                        <td className="px-4 py-3">{c.memberName}</td>
                        <td className="px-4 py-3">{c.memberNumber}</td>
                        <td className="px-4 py-3">{CONSENT_PURPOSE_LABELS[c.purpose]}</td>
                        <td className="px-4 py-3">{c.version}</td>
                        <td className="px-4 py-3">{c.grantedAt ? new Date(c.grantedAt).toLocaleDateString("en-GB") : "-"}</td>
                        <td className="px-4 py-3">{c.withdrawnAt ? new Date(c.withdrawnAt).toLocaleDateString("en-GB") : "-"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                            {CONSENT_STATUS_LABELS[c.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "versions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-2">Purpose</th>
                  <th className="px-4 py-2">Version</th>
                  <th className="px-4 py-2">Effective</th>
                  <th className="px-4 py-2">Summary</th>
                  <th className="px-4 py-2">Published by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {versions.map((v) => (
                  <tr key={v.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3">{CONSENT_PURPOSE_LABELS[v.purpose]}</td>
                    <td className="px-4 py-3">{v.version}</td>
                    <td className="px-4 py-3">{new Date(v.effectiveAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">{v.summary}</td>
                    <td className="px-4 py-3">{v.publishedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "clay" | "danger" | "success" }) {
  const tones: Record<string, string> = {
    ink: "text-ink", clay: "text-clay", danger: "text-red-600", success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
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
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getExecutiveKpis,
  getSuccessCriteria,
  getMembershipGrowth,
  getChapterLeague,
  canGenerateImpactReport,
  formatMoney,
  formatPercent,
} from "@/lib/mock/analytics";

type SectionKey =
  | "cover"
  | "executive"
  | "membership"
  | "chapters"
  | "learning"
  | "financial"
  | "compliance"
  | "appendix";

interface SectionDef {
  key: SectionKey;
  label: string;
  enabled: boolean;
  titleOverride: string;
}

const DEFAULT_SECTIONS: SectionDef[] = [
  { key: "cover", label: "Cover", enabled: true, titleOverride: "" },
  { key: "executive", label: "Executive summary", enabled: true, titleOverride: "" },
  { key: "membership", label: "Membership", enabled: true, titleOverride: "" },
  { key: "chapters", label: "Chapters", enabled: true, titleOverride: "" },
  { key: "learning", label: "Learning", enabled: true, titleOverride: "" },
  { key: "financial", label: "Financial", enabled: true, titleOverride: "" },
  { key: "compliance", label: "Compliance", enabled: false, titleOverride: "" },
  { key: "appendix", label: "Appendix: methodology and sources", enabled: true, titleOverride: "" },
];

interface RunRow {
  id: string;
  title: string;
  audience: string;
  period: string;
  generatedAt: string;
  pdfUrl: string;
  csvUrl: string;
}

const seedRuns: RunRow[] = [
  {
    id: "run-1",
    title: "Q2 2026 Donor Report",
    audience: "DONOR",
    period: "Apr-Jun 2026",
    generatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    pdfUrl: "#",
    csvUrl: "#",
  },
  {
    id: "run-2",
    title: "Q1 2026 Partner Report",
    audience: "PARTNER",
    period: "Jan-Mar 2026",
    generatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    pdfUrl: "#",
    csvUrl: "#",
  },
];

export default function ImpactReportBuilderPage() {
  const [title, setTitle] = useState("TEG Impact Report");
  const [preparedFor, setPreparedFor] = useState("");
  const [audience, setAudience] = useState<"DONOR" | "PARTNER" | "PUBLIC">("DONOR");
  const [from, setFrom] = useState("2026-04-01");
  const [to, setTo] = useState("2026-06-30");
  const [sections, setSections] = useState<SectionDef[]>(DEFAULT_SECTIONS);
  const [includeTargets, setIncludeTargets] = useState(true);
  const [includePerChapter, setIncludePerChapter] = useState(true);
  const [includeSourceNotes, setIncludeSourceNotes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [runs, setRuns] = useState<RunRow[]>(seedRuns);

  const canGenerate = canGenerateImpactReport();
  const kpis = useMemo(() => getExecutiveKpis(), []);
  const criteria = useMemo(() => getSuccessCriteria(), []);
  const growth = useMemo(() => getMembershipGrowth(), []);
  const chapters = useMemo(() => getChapterLeague(), []);

  if (!canGenerate) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to generate impact reports.
        </div>
      </div>
    );
  }

  const toggleSection = (key: SectionKey) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveSection = (key: SectionKey, direction: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const titleValid = title.trim().length >= 5;
  const periodValid = from <= to;

  const handleGenerate = () => {
    if (!titleValid || !periodValid) return;
    setGenerating(true);
    // Simulate generation delay. Real implementation is a background job.
    setTimeout(() => {
      const newRun: RunRow = {
        id: `run-${runs.length + 1}`,
        title,
        audience,
        period: `${from} to ${to}`,
        generatedAt: new Date().toISOString(),
        pdfUrl: "#",
        csvUrl: "#",
      };
      setRuns([newRun, ...runs]);
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Impact report</h1>
        <p className="mt-1 text-sm text-ink/60">
          Generate a funder-ready summary of what has been achieved.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Report metadata
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Report title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                />
                {!titleValid && <span className="mt-1 block text-xs text-red-600">Title must be at least 5 characters.</span>}
              </Field>
              <Field label="Audience">
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as typeof audience)}
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                >
                  <option value="DONOR">Donor</option>
                  <option value="PARTNER">Partner</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </Field>
              <Field label="Prepared for">
                <input
                  value={preparedFor}
                  onChange={(e) => setPreparedFor(e.target.value)}
                  placeholder="Optional recipient name"
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="From">
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="To">
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                </Field>
              </div>
            </div>
            {!periodValid && <span className="mt-1 block text-xs text-red-600">From date must be on or before To date.</span>}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Sections
            </h2>
            <ul className="space-y-2">
              {sections.map((s, idx) => (
                <li key={s.key} className="flex items-center gap-3 rounded-md border border-ink/10 p-3">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggleSection(s.key)}
                    aria-label={`Enable ${s.label}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink">{s.label}</div>
                    {s.enabled && (
                      <input
                        value={s.titleOverride}
                        onChange={(e) =>
                          setSections((prev) =>
                            prev.map((x) => (x.key === s.key ? { ...x, titleOverride: e.target.value } : x))
                          )
                        }
                        placeholder="Optional title override"
                        className="mt-1 w-full rounded-md border border-ink/20 bg-white px-2 py-1 text-xs"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(s.key, -1)}
                      disabled={idx === 0}
                      aria-label={`Move ${s.label} up`}
                      className="rounded border border-ink/20 px-2 text-xs disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(s.key, 1)}
                      disabled={idx === sections.length - 1}
                      aria-label={`Move ${s.label} down`}
                      className="rounded border border-ink/20 px-2 text-xs disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Options</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeTargets} onChange={(e) => setIncludeTargets(e.target.checked)} />
              Include targets
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includePerChapter} onChange={(e) => setIncludePerChapter(e.target.checked)} />
              Include per-chapter detail
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeSourceNotes} onChange={(e) => setIncludeSourceNotes(e.target.checked)} />
              Include source notes
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-ink/60">
              <input type="checkbox" checked disabled />
              Redact member identifiers (locked on)
            </label>

            <div className="mt-5">
              <Button
                variant="primary"
                fullWidth
                disabled={!titleValid || !periodValid || generating}
                onClick={handleGenerate}
              >
                {generating ? "Generating..." : "Generate report"}
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Recent runs</h2>
            {runs.length === 0 ? (
              <p className="text-sm text-ink/60">No reports generated yet. Build one above.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {runs.slice(0, 5).map((r) => (
                  <li key={r.id} className="rounded-md border border-ink/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">{r.title}</span>
                      <span className="text-xs text-ink/50">{new Date(r.generatedAt).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink/60">
                      {r.audience} / {r.period}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a href={r.pdfUrl} className="text-xs text-sky hover:underline">Download PDF</a>
                      <a href={r.csvUrl} className="text-xs text-sky hover:underline">Download CSV</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Preview</h2>
          <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs text-clay">Draft</span>
        </div>

        <article className="space-y-8">
          {sections.filter((s) => s.enabled).map((s) => (
            <section key={s.key}>
              <h3 className="text-lg font-semibold text-ink">
                {s.titleOverride || s.label}
              </h3>

              {s.key === "cover" && (
                <div className="mt-3 rounded-md border border-ink/10 bg-white p-6">
                  <div className="text-xs uppercase tracking-wide text-ink/50">Eagle Generation</div>
                  <div className="mt-2 text-2xl font-semibold text-ink">{title}</div>
                  <div className="mt-1 text-sm text-ink/60">
                    {audience === "DONOR" ? "Prepared for donors" : audience === "PARTNER" ? "Prepared for partners" : "For public distribution"}
                  </div>
                  {preparedFor && <div className="mt-1 text-sm text-ink/60">Prepared for: {preparedFor}</div>}
                  <div className="mt-1 text-sm text-ink/60">
                    Period: {from} to {to}
                  </div>
                </div>
              )}

              {s.key === "executive" && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-ink/70">
                    This report covers {criteria.length} success criteria and {kpis.length} headline metrics over the period {from} to {to}.
                  </p>
                  <ul className="space-y-2 text-sm">
                    {criteria.map((c) => (
                      <li key={c.id} className="flex items-center justify-between border-b border-ink/5 pb-1">
                        <span className="text-ink/70">{c.label}</span>
                        <span className="text-ink">
                          {c.unit === "money" && c.currency
                            ? formatMoney(c.actual, c.currency)
                            : c.unit === "percent"
                            ? formatPercent(c.actual)
                            : c.actual.toLocaleString()}
                          {includeTargets && (
                            <span className="ml-2 text-xs text-ink/50">
                              target{" "}
                              {c.unit === "money" && c.currency
                                ? formatMoney(c.target, c.currency)
                                : c.unit === "percent"
                                ? formatPercent(c.target)
                                : c.target.toLocaleString()}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.key === "membership" && (
                <div className="mt-3 space-y-3 text-sm">
                  <p className="text-ink/70">
                    Members grew from {growth[0]?.value ?? 0} to {growth[growth.length - 1]?.value ?? 0} over the reporting period.
                  </p>
                  <ul className="space-y-1 text-ink/70">
                    {growth.map((g) => (
                      <li key={g.date} className="flex justify-between border-b border-ink/5 pb-1">
                        <span>{g.date.slice(0, 7)}</span>
                        <span>{g.value} members</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.key === "chapters" && (
                <div className="mt-3 text-sm">
                  {includePerChapter ? (
                    <table className="w-full text-sm">
                      <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                        <tr>
                          <th className="px-3 py-2">Chapter</th>
                          <th className="px-3 py-2">Members</th>
                          <th className="px-3 py-2">Retention</th>
                          <th className="px-3 py-2">Completion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {chapters.map((c) => (
                          <tr key={c.code}>
                            <td className="px-3 py-2">{c.name}</td>
                            <td className="px-3 py-2">{c.members}</td>
                            <td className="px-3 py-2">
                              {c.insufficientData ? "—" : formatPercent(c.retention)}
                            </td>
                            <td className="px-3 py-2">
                              {c.insufficientData ? "—" : formatPercent(c.completion)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-ink/70">
                      {chapters.length} active chapters, average {Math.round(chapters.reduce((s, c) => s + c.members, 0) / Math.max(1, chapters.length))} members per chapter.
                    </p>
                  )}
                </div>
              )}

              {s.key === "learning" && (
                <p className="mt-3 text-sm text-ink/70">
                  Learning section: enrolment, completion, and drop-off across the three pillars. Figures sourced from PNL-05.
                </p>
              )}

              {s.key === "financial" && (
                <p className="mt-3 text-sm text-ink/70">
                  Financial section: revenue by surface, settlement health, reconciliation rate. Figures sourced from PNL-09.
                </p>
              )}

              {s.key === "compliance" && (
                <p className="mt-3 text-sm text-ink/70">
                  Compliance section: gates passed, KYC volume, and control evidence. Figures sourced from PNL-15.
                </p>
              )}

              {s.key === "appendix" && (
                <div className="mt-3 space-y-2 text-sm text-ink/70">
                  <p>
                    All figures in this report are based on platform data ending {to}. Denominators are stated for every rate.
                  </p>
                  {includeSourceNotes && (
                    <ul className="list-disc space-y-1 pl-5 text-xs text-ink/60">
                      <li>Membership: PNL-03, PNL-17 ADM-211</li>
                      <li>Chapters: PNL-04, PNL-17 ADM-215</li>
                      <li>Learning: PNL-05, PNL-17 ADM-212</li>
                      <li>Financial: PNL-09, PNL-17 ADM-214</li>
                      <li>Compliance: PNL-15, PNL-16</li>
                    </ul>
                  )}
                  <p className="text-xs text-ink/50">
                    Targets are labelled as targets and are not achieved figures.
                  </p>
                </div>
              )}
            </section>
          ))}
        </article>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">{label}</span>
      {children}
    </label>
  );
}
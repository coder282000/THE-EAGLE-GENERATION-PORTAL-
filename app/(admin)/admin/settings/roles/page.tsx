"use client";

import { getRoles, canViewSystemSettings } from "@/lib/mock/system-settings";

const CAPABILITIES: { capability: string; values: Record<string, string> }[] = [
  { capability: "View public content", values: { GUEST: "Y", MEMBER: "Y", MENTOR: "Y", CIRCLE_LEADER: "Y", CHAPTER_LEADER: "Y", FINANCE_OFFICER: "Y", ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Submit application", values: { GUEST: "Y" } },
  { capability: "View own profile", values: { MEMBER: "S", MENTOR: "S", CIRCLE_LEADER: "S", CHAPTER_LEADER: "S", FINANCE_OFFICER: "S", ADMIN: "S", SUPER_ADMIN: "S" } },
  { capability: "Review applications", values: { ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Approve or reject application", values: { ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Suspend member", values: { ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Create chapter event", values: { CHAPTER_LEADER: "C", ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Enrol in course", values: { MEMBER: "S", MENTOR: "S", CIRCLE_LEADER: "S", CHAPTER_LEADER: "S", FINANCE_OFFICER: "S", ADMIN: "S", SUPER_ADMIN: "S" } },
  { capability: "Create or edit course", values: { MENTOR: "A", ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Grade assignment", values: { MENTOR: "A", ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Post to feed", values: { MEMBER: "Y", MENTOR: "Y", CIRCLE_LEADER: "Y", CHAPTER_LEADER: "Y", FINANCE_OFFICER: "Y", ADMIN: "Y", SUPER_ADMIN: "Y" } },
  { capability: "Issue refund", values: { FINANCE_OFFICER: "Y*", ADMIN: "Y*", SUPER_ADMIN: "Y*" } },
  { capability: "Approve withdrawal", values: { FINANCE_OFFICER: "Y*", SUPER_ADMIN: "Y*" } },
  { capability: "View AML alert queue", values: { ADMIN: "Y", SUPER_ADMIN: "Y" } },
];

export default function RolesPage() {
  const canView = canViewSystemSettings();
  const roles = getRoles();

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Roles and permissions</h1>
        <p className="mt-1 text-sm text-ink/60">
          Read-only. Role assignment happens in Members (ADM-034).
        </p>
      </header>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Roles</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {roles.map((r) => (
            <li key={r.code} className="rounded-md border border-ink/10 p-3">
              <div className="font-semibold text-ink">{r.name}</div>
              <div className="mt-1 text-xs text-ink/50"><code>{r.code}</code></div>
              <div className="mt-1 text-xs text-ink/60">{r.description}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Capability matrix</h2>
        <p className="mb-3 text-xs text-ink/60">Y full · S self only · C own chapter only · A assigned only · blank none · Y* four-eyes required</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-3 py-2">Capability</th>
                {roles.map((r) => (
                  <th key={r.code} className="px-3 py-2">{r.code}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {CAPABILITIES.map((c) => (
                <tr key={c.capability}>
                  <td className="px-3 py-2">{c.capability}</td>
                  {roles.map((r) => (
                    <td key={r.code} className="px-3 py-2 text-ink/70">{c.values[r.code] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
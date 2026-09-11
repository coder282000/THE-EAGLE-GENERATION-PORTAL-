"use client";

import { getHealth, getEnvironment, canViewSystemSettings, HEALTH_STATUS_TONE } from "@/lib/mock/system-settings";

export default function HealthPage() {
  const canView = canViewSystemSettings();
  const components = getHealth();
  const env = getEnvironment();

  if (!canView || !env) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">System health</h1>
        <p className="mt-1 text-sm text-ink/60">Read-only. No configuration here.</p>
      </header>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Environment</h2>
        <dl className="grid gap-3 sm:grid-cols-4 text-sm">
          <Row k="Name" v={env.name} />
          <Row k="Region" v={env.region} />
          <Row k="Version" v={env.version} />
          <Row k="Commit" v={env.commit} />
          <Row k="Deployed" v={new Date(env.deployedAt).toLocaleString("en-GB")} />
        </dl>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Components</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-2">Component</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {components.map((c) => (
                <tr key={c.component}>
                  <td className="px-4 py-3">{c.component}</td>
                  <td className={"px-4 py-3 " + HEALTH_STATUS_TONE[c.status]}>{c.status}</td>
                  <td className="px-4 py-3 text-ink/70">{c.detail}</td>
                  <td className="px-4 py-3 text-ink/60">{c.metric ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
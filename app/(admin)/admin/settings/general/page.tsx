"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { getGeneralConfig, canViewSystemSettings, canEditSystemSettings } from "@/lib/mock/system-settings";

export default function GeneralConfigPage() {
  const canView = canViewSystemSettings();
  const canEdit = canEditSystemSettings();
  const initial = getGeneralConfig();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  if (!canView || !form) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm({ ...form, [k]: v });
    setSaved(false);
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">General configuration</h1>
        <p className="mt-1 text-sm text-ink/60">Platform-wide settings. Every save is audited.</p>
      </header>

      {saved && (
        <div className="rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm text-green-800">
          Settings saved.
        </div>
      )}

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform name">
            <input value={form.platformName} onChange={(e) => set("platformName", e.target.value)} disabled={!canEdit}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5" />
          </Field>
          <Field label="Support email">
            <input value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} disabled={!canEdit}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5" />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Financial defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default currency (ISO 4217)">
            <input value={form.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value)} disabled={!canEdit}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5" />
          </Field>
          <Field label="Default timezone (IANA)">
            <input value={form.defaultTimezone} onChange={(e) => set("defaultTimezone", e.target.value)} disabled={!canEdit}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5" />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Membership control</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.newMemberApplicationOpen} disabled={!canEdit}
            onChange={(e) => set("newMemberApplicationOpen", e.target.checked)} />
          <span>Applications are open</span>
        </label>
        <p className="mt-2 text-xs text-ink/60">When closed, the public application form shows a notice.</p>
      </section>

      {canEdit && (
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setSaved(true)}>Save</Button>
          <Button variant="outline" onClick={() => { setForm(initial); setSaved(false); }}>Reset</Button>
        </div>
      )}
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
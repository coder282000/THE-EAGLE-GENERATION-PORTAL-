"use client";

import { useState } from "react";
import { getLocales, canViewSystemSettings, canEditSystemSettings } from "@/lib/mock/system-settings";

export default function LocalesPage() {
  const canView = canViewSystemSettings();
  const canEdit = canEditSystemSettings();
  const [locales, setLocales] = useState(getLocales());

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const toggle = (id: string) => {
    setLocales((prev) => prev.map((l) => l.id === id ? {
      ...l,
      status: l.status === "COMPLETE" ? "IN_PROGRESS" : "COMPLETE",
    } : l));
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Localisation</h1>
        <p className="mt-1 text-sm text-ink/60">
          English is source. French (DRC) and Kiswahili are prepared for later releases.
        </p>
      </header>

      <ul className="space-y-3">
        {locales.map((l) => {
          const pct = l.totalKeys > 0 ? Math.round((l.translatedKeys / l.totalKeys) * 100) : 0;
          const isSource = l.locale === "en";
          return (
            <li key={l.id} className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">{l.language}</h2>
                  <p className="text-xs text-ink/50"><code>{l.locale}</code></p>
                  <p className="mt-1 text-sm text-ink/60">
                    {l.translatedKeys} / {l.totalKeys} keys translated · {l.status.replace("_", " ")}
                  </p>
                </div>
                <div className="min-w-[160px] flex-1 max-w-xs">
                  <div className="h-2 w-full rounded-full bg-ink/10" role="progressbar"
                    aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-2 rounded-full bg-sky" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-right text-xs text-ink/60">{pct}%</div>
                </div>
                {canEdit && !isSource && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(l.id)}
                      className="rounded-md border border-ink/20 px-3 py-1 text-xs hover:bg-ink/5"
                    >
                      {l.status === "COMPLETE" ? "Mark in progress" : "Mark complete"}
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
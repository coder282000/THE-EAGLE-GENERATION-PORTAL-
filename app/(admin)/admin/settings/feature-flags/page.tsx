"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { getFeatureFlags, canViewSystemSettings, canManageFeatureFlags, type FeatureFlag } from "@/lib/mock/system-settings";

export default function FeatureFlagsPage() {
  const canView = canViewSystemSettings();
  const canManage = canManageFeatureFlags();
  const initial = getFeatureFlags();
  const [flags, setFlags] = useState(initial);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const toggle = (key: FeatureFlag["key"], next: boolean) => {
    setFlags((prev) => prev.map((f) => f.key === key ? { ...f, enabled: next, lastChangedAt: new Date().toISOString(), lastChangedBy: "current-user" } : f));
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Feature flags</h1>
        <p className="mt-1 text-sm text-ink/60">
          Compliance-gated. Flag state changes are audited against the gate they depend on.
        </p>
      </header>

      <div className="rounded-lg border border-clay/40 bg-clay/5 p-4 text-sm text-ink">
        <strong>Compliance gating.</strong> A flag cannot be enabled until its required gate is
        approved. The Compliance Lead controls these flags.
      </div>

      <ul className="space-y-3">
        {flags.map((f) => {
          const blocked = !f.gateApproved && !f.enabled;
          return (
            <li key={f.key} className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[200px] flex-1">
                  <h2 className="text-base font-semibold text-ink">{f.name}</h2>
                  <p className="mt-1 text-sm text-ink/70">{f.description}</p>
                  <p className="mt-2 text-xs text-ink/50">
                    Key: <code className="rounded bg-ink/5 px-1">{f.key}</code> · Requires gate:{" "}
                    <strong>{f.requiresGate}</strong> · Controlled by: {f.controlledBy}
                  </p>
                  {f.lastChangedAt && (
                    <p className="mt-1 text-xs text-ink/50">
                      Last changed: {new Date(f.lastChangedAt).toLocaleString("en-GB")} by {f.lastChangedBy}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={"text-xs " + (f.gateApproved ? "text-green-700" : "text-clay")}>
                    Gate {f.requiresGate}: {f.gateApproved ? "approved" : "not approved"}
                  </span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      disabled={!canManage || blocked}
                      onChange={(e) => toggle(f.key, e.target.checked)}
                    />
                    <span>{f.enabled ? "Enabled" : "Disabled"}</span>
                  </label>
                  {blocked && canManage && (
                    <span className="text-xs text-red-600">Cannot enable: gate not approved.</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { canViewSystemSettings, canEditSystemSettings } from "@/lib/mock/system-settings";

export default function MaintenancePage() {
  const canView = canViewSystemSettings();
  const canEdit = canEditSystemSettings();
  const [mode, setMode] = useState(false);
  const [message, setMessage] = useState("The portal is under scheduled maintenance. We will be back shortly.");
  const [confirming, setConfirming] = useState(false);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Maintenance mode</h1>
        <p className="mt-1 text-sm text-ink/60">
          When enabled, non-admin sessions are logged out and users see the maintenance notice.
        </p>
      </header>

      <div className={"rounded-lg border p-4 text-sm " + (mode ? "border-red-600/40 bg-red-50 text-red-900" : "border-green-600/30 bg-green-50 text-green-900")}>
        <strong>{mode ? "Maintenance mode is enabled." : "Platform is operational."}</strong>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={mode} disabled={!canEdit} onChange={() => setConfirming(true)} />
          <span>Enable maintenance mode</span>
        </label>
        <p className="mt-2 text-xs text-ink/60">Enabling is audited and requires typed confirmation.</p>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">Maintenance message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!canEdit}
            rows={4}
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-ink/5"
          />
        </label>
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">
              {mode ? "Disable maintenance mode?" : "Enable maintenance mode?"}
            </h3>
            <p className="mt-2 text-sm text-ink/70">
              {mode
                ? "The platform will be accessible again immediately."
                : "All non-admin sessions will be logged out. Users will see the maintenance page."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button variant={mode ? "primary" : "destructive"} onClick={() => { setMode(!mode); setConfirming(false); }}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
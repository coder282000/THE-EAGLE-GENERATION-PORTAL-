"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { getTemplates, canViewSystemSettings, canEditSystemSettings } from "@/lib/mock/system-settings";

export default function TemplatesPage() {
  const canView = canViewSystemSettings();
  const canEdit = canEditSystemSettings();
  const all = useMemo(() => getTemplates(), []);
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const filtered = channelFilter === "all" ? all : all.filter((t) => t.channel === channelFilter);
  const selected = all.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Notification templates</h1>
        <p className="mt-1 text-sm text-ink/60">Editing creates a new version. The previous version is retained.</p>
      </header>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 p-4">
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            <option value="all">All channels</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="PUSH">Push</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Updated</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3"><code className="rounded bg-ink/5 px-1 text-xs">{t.key}</code></td>
                  <td className="px-4 py-3">{t.channel}</td>
                  <td className="px-4 py-3">v{t.version}</td>
                  <td className="px-4 py-3">{t.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{new Date(t.updatedAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <Button variant="outline" onClick={() => setSelectedId(t.id)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">{selected.name}</h3>
            <p className="mt-1 text-xs text-ink/50">
              {selected.channel} · {selected.key} · v{selected.version}
            </p>
            {selected.subject && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-ink/60">Subject</div>
                <div className="mt-1 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">{selected.subject}</div>
              </div>
            )}
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-ink/60">Body</div>
              <div className="mt-1 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm whitespace-pre-wrap">{selected.body}</div>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              {canEdit ? "Saving creates a new version." : "Read-only."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
              {canEdit && <Button variant="primary" onClick={() => setSelectedId(null)}>Save as new version</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

// ADM-062 — Content Library
// Route: /admin/learning/library

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getContentLibrary,
  canViewLearning,
  canAuthorCourses,
  type ContentAsset,
} from '@/lib/mock/learning';

type KindFilter = 'ALL' | ContentAsset['kind'];

const KIND_LABELS: Record<ContentAsset['kind'], string> = {
  VIDEO: 'Video',
  PDF: 'PDF',
  IMAGE: 'Image',
  AUDIO: 'Audio',
};

const KIND_TONE: Record<ContentAsset['kind'], string> = {
  VIDEO: 'bg-sky/15 text-sky',
  PDF: 'bg-clay/15 text-clay',
  IMAGE: 'bg-emerald-100 text-emerald-800',
  AUDIO: 'bg-ink/10 text-ink/70',
};

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function ContentLibraryPage() {
  const allowed = canViewLearning();
  const canUpload = canAuthorCourses();

  const assets = useMemo(() => (allowed ? getContentLibrary() : []), [allowed]);

  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = assets;
    if (kindFilter !== 'ALL') list = list.filter((a) => a.kind === kindFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.uploadedBy.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assets, kindFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the learning panel.</p>
        </Card>
      </div>
    );
  }

  const totalSize = assets.reduce((s, a) => s + a.sizeMb, 0);
  const unusedCount = assets.filter((a) => a.usageCount === 0).length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Content Library</h1>
        <p className="mt-1 text-sm text-ink/70">
          Reusable video, PDF, image, and audio assets. Assets can be attached to multiple lessons across
          multiple courses.
        </p>
      </header>

      <section aria-label="Library summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total assets" value={String(assets.length)} />
        <Kpi label="Videos" value={String(assets.filter((a) => a.kind === 'VIDEO').length)} />
        <Kpi label="Total size" value={`${totalSize.toFixed(1)} MB`} hint="Excludes external videos" />
        <Kpi
          label="Unused"
          value={String(unusedCount)}
          hint={unusedCount > 0 ? 'Candidates for cleanup' : 'All assets in use'}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="lib-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="lib-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Asset name or uploader…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="lib-kind" className="block text-xs font-medium text-ink/70">Kind</label>
            <select
              id="lib-kind"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as KindFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All kinds</option>
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">Image</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>
          {canUpload ? (
            <div className="ml-auto">
              <button
                type="button"
                className="rounded-md bg-sky px-3 py-2 text-sm font-medium text-white hover:bg-sky/90"
              >
                Upload asset
              </button>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Content library</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Name</th>
                <th scope="col" className="py-2 pr-4">Kind</th>
                <th scope="col" className="py-2 pr-4 text-right">Size</th>
                <th scope="col" className="py-2 pr-4 text-right">Usage</th>
                <th scope="col" className="py-2 pr-4">Uploaded by</th>
                <th scope="col" className="py-2 pr-4">Uploaded</th>
                <th scope="col" className="py-2 pr-4">URL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                    No assets match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 text-ink">{a.name}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${KIND_TONE[a.kind]}`}>
                        {KIND_LABELS[a.kind]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{a.sizeMb.toFixed(1)} MB</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {a.usageCount === 0 ? (
                        <span className="text-clay">Unused</span>
                      ) : (
                        `${a.usageCount}×`
                      )}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink/70">{a.uploadedBy}</td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(a.uploadedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink/60">
                      {a.url.length > 40 ? a.url.slice(0, 40) + '…' : a.url}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Library conventions</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>Videos are always hosted externally. The library stores the URL, never the file.</li>
          <li>PDFs, images, and audio may be stored on the platform&apos;s S3-compatible storage.</li>
          <li>Assets are versioned. Editing an asset creates a new version; existing references stay on
            the pinned version until updated.</li>
          <li>Unused assets are surfaced here for periodic cleanup. They are never auto-deleted.</li>
          <li>The library is shared across all courses — an asset can be reused many times.</li>
        </ul>
      </Card>
    </div>
  );
}
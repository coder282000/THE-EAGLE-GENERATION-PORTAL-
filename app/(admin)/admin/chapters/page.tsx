"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { ShieldAlert, Plus, RefreshCw, Building2, Users } from "lucide-react";
import {
  getChapters,
  getRegionOptions,
  canViewChapters,
  canCreateChapter,
  CHAPTER_TYPE_LABELS,
  type Chapter,
} from "@/lib/mock/chapters";

const TYPE_FILTERS: { value: Chapter["type"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "All types" },
  { value: "CAMPUS", label: "Campus" },
  { value: "PROFESSIONAL", label: "Professional" },
];

const TYPE_BADGE: Record<Chapter["type"], string> = {
  CAMPUS: "bg-sky-50 text-sky-700",
  PROFESSIONAL: "bg-dawn-50 text-dawn-700",
};

const PAGE_SIZE = 10;

export default function ChaptersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<Chapter["type"] | "ALL">("ALL");
  const [regionFilter, setRegionFilter] = useState<string | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const canView = canViewChapters();
  const canCreate = canCreateChapter();
  const regions = useMemo(() => getRegionOptions(), []);

  const chapters = useMemo(
    () =>
      canView
        ? getChapters({ search, type: typeFilter, region: regionFilter })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canView, search, typeFilter, regionFilter, refreshKey]
  );

  const totalItems = chapters.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const visible = chapters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const source = canView ? getChapters({}) : [];
    return {
      total: source.length,
      campus: source.filter((c) => c.type === "CAMPUS").length,
      professional: source.filter((c) => c.type === "PROFESSIONAL").length,
      members: source.reduce((sum, c) => sum + c.memberCount, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, refreshKey]);

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have access to the chapters panel.
          </p>
          <div className="mt-6">
            <Link href="/admin/dashboard">
              <Button variant="primary">Return to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Chapters
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Campus and professional chapters across the movement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/chapters/institutions">
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Institutions
            </Button>
          </Link>
          {canCreate && (
            <Link href="/admin/chapters/new">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New chapter
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            onClick={() => setRefreshKey((k) => k + 1)}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total chapters" value={stats.total} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Campus" value={stats.campus} tone="sky" />
        <StatCard label="Professional" value={stats.professional} tone="dawn" />
        <StatCard label="Total members" value={stats.members} icon={<Users className="h-4 w-4" />} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, code, location or leader…"
              aria-label="Search chapters"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as Chapter["type"] | "ALL");
              setPage(1);
            }}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by region"
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="ALL">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">List of chapters</caption>
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Code</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                  Type
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">
                  Region
                </th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Members</th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 lg:table-cell">
                  Leader
                </th>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {visible.map((c) => (
                <tr key={c.code} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <span className="inline-block rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-medium text-ink-700">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-ink-400 line-clamp-1">
                        {c.description}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[c.type]}`}
                    >
                      {CHAPTER_TYPE_LABELS[c.type]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {c.location}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-ink-900">
                    {c.memberCount}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 lg:table-cell">
                    {c.leader ?? <span className="italic text-ink-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/chapters/${encodeURIComponent(c.code)}`}
                      className="text-sm font-medium text-sky-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-ink-900">No chapters found</p>
            <p className="mt-1 text-sm text-ink-500">
              {search || typeFilter !== "ALL" || regionFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Chapters will appear here once created."}
            </p>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
        />
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "ink",
  icon,
}: {
  label: string;
  value: number;
  tone?: "ink" | "sky" | "dawn";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "sky"
      ? "text-sky-700"
      : tone === "dawn"
      ? "text-dawn-700"
      : "text-ink-900";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-500">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>
        {value.toLocaleString()}
      </p>
    </Card>
  );
}
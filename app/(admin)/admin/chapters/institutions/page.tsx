"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import {
  mockInstitutions,
  MOU_STATUS_LABELS,
  type Institution,
  type MOUStatus,
} from "@/lib/mock/institutions";
import { canViewInstitutions, canEditInstitutions } from "@/lib/mock/chapters";
import { ArrowLeft, ShieldAlert, Plus, Building2 } from "lucide-react";

const MOU_BADGE: Record<MOUStatus, string> = {
  SIGNED: "bg-green-50 text-green-700",
  PENDING: "bg-dawn-50 text-dawn-700",
  EXPIRED: "bg-clay-50 text-clay-700",
  NONE: "bg-ink-100 text-ink-500",
};

const STATUS_FILTERS: { value: MOUStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All MOU statuses" },
  { value: "SIGNED", label: "Signed" },
  { value: "PENDING", label: "Pending" },
  { value: "EXPIRED", label: "Expired" },
  { value: "NONE", label: "None" },
];

const PAGE_SIZE = 10;

export default function InstitutionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MOUStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const canView = canViewInstitutions();
  const canEdit = canEditInstitutions();

  const institutions = useMemo(() => {
    if (!canView) return [];
    let result = [...mockInstitutions];
    if (statusFilter !== "ALL") {
      result = result.filter((i) => i.mouStatus === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.country.toLowerCase().includes(q)
      );
    }
    return result;
  }, [canView, search, statusFilter]);

  const totalItems = institutions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const visible = institutions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to view the institution registry.
          </p>
          <div className="mt-6">
            <Link href="/admin/chapters">
              <Button variant="primary">Back to chapters</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const stats = {
    total: mockInstitutions.length,
    signed: mockInstitutions.filter((i) => i.mouStatus === "SIGNED").length,
    pending: mockInstitutions.filter((i) => i.mouStatus === "PENDING").length,
    countries: new Set(mockInstitutions.map((i) => i.country)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/chapters"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Chapters
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
            Institutions
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Partner universities and institutions with MOU status.
          </p>
        </div>
        {canEdit && (
          <Button variant="primary" onClick={() => alert("Add institution coming soon.")}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New institution
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="MOU signed" value={stats.signed} tone="green" />
        <StatCard label="Pending" value={stats.pending} tone="dawn" />
        <StatCard label="Countries" value={stats.countries} tone="sky" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, city or country…"
              aria-label="Search institutions"
            />
          </div>
          <select
            aria-label="Filter by MOU status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as MOUStatus | "ALL");
              setPage(1);
            }}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Partner institutions</caption>
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Institution</th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                  City
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">
                  Country
                </th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">MOU status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 lg:table-cell">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {visible.map((i: Institution) => (
                <tr key={i.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{i.name}</p>
                    {i.notes && (
                      <p className="text-xs text-ink-400 line-clamp-1">{i.notes}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">
                    {i.city}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {i.country}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${MOU_BADGE[i.mouStatus]}`}
                    >
                      {MOU_STATUS_LABELS[i.mouStatus]}
                    </span>
                    {i.mouExpiresAt && (
                      <p className="mt-1 text-[10px] text-ink-400">
                        Expires {formatDate(i.mouExpiresAt)}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-ink-600 lg:table-cell">
                    {i.contactName ? (
                      <div>
                        <p>{i.contactName}</p>
                        <p className="text-ink-400">{i.contactEmail}</p>
                      </div>
                    ) : (
                      <span className="italic text-ink-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-ink-900">No institutions found</p>
            <p className="mt-1 text-sm text-ink-500">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Institutions will appear here once registered."}
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
  tone?: "ink" | "green" | "dawn" | "sky";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "dawn"
      ? "text-dawn-700"
      : tone === "sky"
      ? "text-sky-700"
      : "text-ink-900";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-500">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Pagination } from "@/components/ui/pagination";
import { ShieldAlert, Download, Upload, RefreshCw } from "lucide-react";
import {
  getApplications,
  canViewApplications,
  canDecideApplication,
  canExportApplications,
  canBulkImport,
  PENDING_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TIER_LABELS,
  type Application,
  type ApplicationStatus,
  type ApplicationTier,
} from "@/lib/mock/applications";

type SortField = "name" | "reference" | "status" | "tier";
type SortDirection = "asc" | "desc";

const STATUS_FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview scheduled" },
  { value: "INTERVIEWED", label: "Interviewed" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "LAPSED", label: "Lapsed" },
];

const TIER_FILTERS: { value: ApplicationTier | "ALL"; label: string }[] = [
  { value: "ALL", label: "All tiers" },
  { value: "STUDENT", label: "Student" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ASSOCIATE", label: "Associate" },
];

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  DRAFT: "bg-ink-100 text-ink-600",
  SUBMITTED: "bg-dawn-50 text-dawn-700",
  UNDER_REVIEW: "bg-dawn-100 text-dawn-700",
  INTERVIEW_SCHEDULED: "bg-sky-100 text-sky-700",
  INTERVIEWED: "bg-sky-100 text-sky-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-clay-50 text-clay-700",
  WITHDRAWN: "bg-ink-100 text-ink-500",
  LAPSED: "bg-ink-100 text-ink-400",
};

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<ApplicationTier | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("reference");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const canView = canViewApplications();
  const canDecide = canDecideApplication();
  const canExport = canExportApplications();
  const canImport = canBulkImport();

  const allApps = useMemo(
    () =>
      canView
        ? getApplications({
            search,
            status: statusFilter,
            tier: tierFilter,
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canView, search, statusFilter, tierFilter, refreshKey]
  );

  const sorted = useMemo(() => {
    const copy = [...allApps];
    copy.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [allApps, sortField, sortDir]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const source = canView ? getApplications({}) : [];
    return {
      total: source.length,
      pending: source.filter((a) => PENDING_APPLICATION_STATUSES.includes(a.status)).length,
      approved: source.filter((a) => a.status === "APPROVED").length,
      rejected: source.filter((a) => a.status === "REJECTED").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, refreshKey]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleAll = () => {
    const visibleIds = visible.map((a) => a.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleBulk = (action: "approve" | "reject") => {
    // In production: POST /api/v1/admin/applications/bulk-decide
    const n = selectedIds.length;
    // eslint-disable-next-line no-alert
    alert(`${action === "approve" ? "Approved" : "Rejected"} ${n} application${n === 1 ? "" : "s"}.`);
    setSelectedIds([]);
  };

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have access to the applications panel. If you believe this
            is a mistake, contact a Super Admin.
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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Applications
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Review and manage membership applications.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canImport && (
            <Link href="/admin/applications/import">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Import
              </Button>
            </Link>
          )}
          {canExport && (
            <Button variant="outline" onClick={() => alert("Export coming soon.")}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export
            </Button>
          )}
          <Button variant="ghost" onClick={() => setRefreshKey((k) => k + 1)} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} tone="dawn" />
        <StatCard label="Approved" value={stats.approved} tone="green" />
        <StatCard label="Rejected" value={stats.rejected} tone="clay" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, email, reference or chapter…"
              aria-label="Search applications"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ApplicationStatus | "ALL");
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
          <select
            aria-label="Filter by tier"
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value as ApplicationTier | "ALL");
              setPage(1);
            }}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            {TIER_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Bulk actions */}
      {canDecide && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          itemNoun="application"
          actions={[
            { label: "Approve", onClick: () => handleBulk("approve"), variant: "success" },
            { label: "Reject", onClick: () => handleBulk("reject"), variant: "danger" },
          ]}
        />
      )}

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {canDecide && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={
                        visible.length > 0 && visible.every((a) => selectedIds.includes(a.id))
                      }
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                )}
                <SortableTH field="name" current={sortField} dir={sortDir} onClick={handleSort}>
                  Applicant
                </SortableTH>
                <SortableTH field="tier" current={sortField} dir={sortDir} onClick={handleSort} className="hidden sm:table-cell">
                  Tier
                </SortableTH>
                <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">
                  Chapter
                </th>
                <SortableTH field="status" current={sortField} dir={sortDir} onClick={handleSort}>
                  Status
                </SortableTH>
                <SortableTH field="reference" current={sortField} dir={sortDir} onClick={handleSort} className="hidden sm:table-cell">
                  Reference
                </SortableTH>
                <th className="px-4 py-3 text-right font-medium text-ink-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {visible.map((app) => (
                <tr key={app.id} className="hover:bg-ink-50/50">
                  {canDecide && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${app.firstName} ${app.lastName}`}
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleOne(app.id)}
                        className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-xs text-ink-400">{app.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-xs font-medium text-ink-600">
                      {APPLICATION_TIER_LABELS[app.tier]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {truncate(app.chapter, 22)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[app.status] ?? "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-ink-400 sm:table-cell">
                    {app.reference}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
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
            <p className="font-display text-lg text-ink-900">No applications found</p>
            <p className="mt-1 text-sm text-ink-500">
              {search || statusFilter !== "ALL" || tierFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Applications will appear here as they arrive."}
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

// ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: number;
  tone?: "ink" | "dawn" | "green" | "clay";
}) {
  const toneClass =
    tone === "dawn"
      ? "bg-dawn-50 text-dawn-700"
      : tone === "green"
      ? "bg-green-50 text-green-700"
      : tone === "clay"
      ? "bg-clay-50 text-clay-700"
      : "bg-white text-ink-900";
  return (
    <div className={`rounded-lg p-4 text-center shadow-card ${toneClass}`}>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}

function SortableTH({
  field,
  current,
  dir,
  onClick,
  children,
  className = "",
}: {
  field: SortField;
  current: SortField;
  dir: SortDirection;
  onClick: (f: SortField) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const active = current === field;
  return (
    <th className={`px-4 py-3 text-left font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onClick(field)}
        className="flex items-center gap-1 text-ink-500 transition-colors hover:text-ink-700"
      >
        {children}
        {active && <span aria-hidden="true">{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

function getSortValue(a: Application, field: SortField): string {
  switch (field) {
    case "name":
      return `${a.firstName} ${a.lastName}`.toLowerCase();
    case "reference":
      return a.reference;
    case "status":
      return a.status;
    case "tier":
      return a.tier;
  }
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
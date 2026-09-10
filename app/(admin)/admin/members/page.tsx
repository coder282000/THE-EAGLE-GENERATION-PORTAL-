"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/ui/search-input";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Pagination } from "@/components/ui/pagination";
import { ShieldAlert, Download, RefreshCw, Users } from "lucide-react";
import {
  getMembers,
  getChapterOptions,
  getChapterName,
  canViewMembers,
  canSuspendMember,
  canExportMembers,
  MEMBER_TIER_LABELS,
  MEMBER_STATUS_LABELS,
  type Member,
} from "@/lib/mock/members";

type SortField = "name" | "memberNumber" | "tier" | "chapter" | "status" | "joinedAt";
type SortDirection = "asc" | "desc";

const STATUS_FILTERS: { value: Member["status"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

const TIER_FILTERS: { value: Member["tier"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "All tiers" },
  { value: "Eagle", label: "Eagle" },
  { value: "Rising", label: "Rising" },
  { value: "Nestling", label: "Nestling" },
];

const STATUS_BADGE: Record<Member["status"], string> = {
  active: "bg-green-50 text-green-700",
  pending: "bg-dawn-50 text-dawn-700",
  inactive: "bg-ink-100 text-ink-500",
};

const PAGE_SIZE = 10;

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Member["status"] | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<Member["tier"] | "ALL">("ALL");
  const [chapterFilter, setChapterFilter] = useState<string | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("joinedAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const canView = canViewMembers();
  const canSuspend = canSuspendMember();
  const canExport = canExportMembers();

  const chapters = useMemo(() => getChapterOptions(), []);

  const allMembers = useMemo(
    () =>
      canView
        ? getMembers({
            search,
            status: statusFilter,
            tier: tierFilter,
            chapterCode: chapterFilter,
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canView, search, statusFilter, tierFilter, chapterFilter, refreshKey]
  );

  const sorted = useMemo(() => {
    const copy = [...allMembers];
    copy.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [allMembers, sortField, sortDir]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const source = canView ? getMembers({}) : [];
    return {
      total: source.length,
      active: source.filter((m) => m.status === "active").length,
      pending: source.filter((m) => m.status === "pending").length,
      inactive: source.filter((m) => m.status === "inactive").length,
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
    const visibleIds = visible.map((m) => m.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(
      allSelected
        ? selectedIds.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...selectedIds, ...visibleIds]))
    );
  };

  const toggleOne = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleBulkSuspend = () => {
    const n = selectedIds.length;
    // eslint-disable-next-line no-alert
    alert(`Suspended ${n} member${n === 1 ? "" : "s"}. (Mock — API not wired.)`);
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
            You do not have access to the members panel.
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
            Members
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Browse, filter and manage the member directory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canExport && (
            <Button variant="outline" onClick={() => alert("Export coming soon.")}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export
            </Button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active" value={stats.active} tone="green" />
        <StatCard label="Pending" value={stats.pending} tone="dawn" />
        <StatCard label="Inactive" value={stats.inactive} tone="ink" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, email, member number or chapter…"
              aria-label="Search members"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as Member["status"] | "ALL");
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
              setTierFilter(e.target.value as Member["tier"] | "ALL");
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
          <select
            aria-label="Filter by chapter"
            value={chapterFilter}
            onChange={(e) => {
              setChapterFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="ALL">All chapters</option>
            {chapters.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Bulk actions */}
      {canSuspend && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          itemNoun="member"
          actions={[
            {
              label: "Suspend",
              onClick: handleBulkSuspend,
              variant: "danger",
            },
          ]}
        />
      )}

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {canSuspend && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={
                        visible.length > 0 &&
                        visible.every((m) => selectedIds.includes(m.id))
                      }
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                )}
                <SortableTH
                  field="name"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                >
                  Member
                </SortableTH>
                <SortableTH
                  field="memberNumber"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                  className="hidden sm:table-cell"
                >
                  Member #
                </SortableTH>
                <SortableTH
                  field="tier"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                  className="hidden md:table-cell"
                >
                  Tier
                </SortableTH>
                <SortableTH
                  field="chapter"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                  className="hidden md:table-cell"
                >
                  Chapter
                </SortableTH>
                <SortableTH
                  field="status"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                >
                  Status
                </SortableTH>
                <SortableTH
                  field="joinedAt"
                  current={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                  className="hidden sm:table-cell"
                >
                  Joined
                </SortableTH>
                <th className="px-4 py-3 text-right font-medium text-ink-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {visible.map((m) => (
                <tr key={m.id} className="hover:bg-ink-50/50">
                  {canSuspend && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${m.firstName} ${m.lastName}`}
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleOne(m.id)}
                        className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-ink-400">{m.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-ink-500 sm:table-cell">
                    {m.memberNumber}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-xs font-medium text-ink-600">
                      {MEMBER_TIER_LABELS[m.tier]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {getChapterName(m.chapter)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[m.status]}`}
                    >
                      {MEMBER_STATUS_LABELS[m.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-ink-500 sm:table-cell">
                    {formatDate(m.joinedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/members/${m.id}`}
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
            <p className="font-display text-lg text-ink-900">No members found</p>
            <p className="mt-1 text-sm text-ink-500">
              {search || statusFilter !== "ALL" || tierFilter !== "ALL" || chapterFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Members will appear here as they join."}
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
  icon,
}: {
  label: string;
  value: number;
  tone?: "ink" | "green" | "dawn";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
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

function getSortValue(m: Member, field: SortField): string {
  switch (field) {
    case "name":
      return `${m.firstName} ${m.lastName}`.toLowerCase();
    case "memberNumber":
      return m.memberNumber;
    case "tier":
      return m.tier;
    case "chapter":
      return getChapterName(m.chapter);
    case "status":
      return m.status;
    case "joinedAt":
      return m.joinedAt;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
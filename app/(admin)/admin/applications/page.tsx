'use client';
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockApplications } from "@/components/mock/data";

// Match actual mock data statuses
type ApplicationStatus = "pending" | "approved" | "rejected";
type SortField = "name" | "reference" | "status" | "tier";

const STATUS_FILTERS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TIER_FILTERS = [
  { value: "all", label: "All Tiers" },
  { value: "Eagle", label: "🦅 Eagle" },
  { value: "Rising", label: "⬆️ Rising" },
  { value: "Nestling", label: "🐣 Nestling" },
];

export default function ApplicationsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("reference");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 5;

  // Add submittedAt to mock data (for display purposes)
  const applicationsWithDate = useMemo(() => {
    return mockApplications.map((app, index) => {
      // Generate a date based on index (newer applications first)
      const date = new Date();
      date.setDate(date.getDate() - index * 3);
      date.setHours(date.getHours() - index * 2);
      return {
        ...app,
        id: app.reference,
        submittedAt: date.toISOString(),
      };
    });
  }, []);

  // Filter and sort applications
  const filteredAndSorted = useMemo(() => {
    let result = applicationsWithDate;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.reference.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.chapter.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Tier filter
    if (tierFilter !== "all") {
      result = result.filter((app) => app.tier === tierFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "reference":
          aVal = a.reference;
          bVal = b.reference;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "tier":
          aVal = a.tier;
          bVal = b.tier;
          break;
        default:
          aVal = a.reference;
          bVal = b.reference;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, tierFilter, sortField, sortDirection, applicationsWithDate]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map((app) => app.reference));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: "approve" | "reject") => {
    const count = selectedIds.length;
    // In production, this would call an API
    alert(`✅ ${action === "approve" ? "Approved" : "Rejected"} ${count} application${count > 1 ? "s" : ""}.`);
    setSelectedIds([]);
  };

  // Stats
  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter((a) => a.status === "pending").length,
    approved: mockApplications.filter((a) => a.status === "approved").length,
    rejected: mockApplications.filter((a) => a.status === "rejected").length,
  };

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-dawn-50 text-dawn-700",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-clay-50 text-clay-700",
    };
    return styles[status] || "bg-ink-50 text-ink-600";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Applications
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Review and manage membership applications.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => alert("📥 Exporting applications...")}>
              📥 Export
            </Button>
            <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-400">Total</p>
          </div>
          <div className="rounded-lg bg-dawn-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-dawn-700">{stats.pending}</p>
            <p className="text-xs text-dawn-500">Pending</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-green-700">{stats.approved}</p>
            <p className="text-xs text-green-500">Approved</p>
          </div>
          <div className="rounded-lg bg-clay-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-clay-700">{stats.rejected}</p>
            <p className="text-xs text-clay-500">Rejected</p>
          </div>
        </div>

        {/* Filters and search */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or reference..."
                className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status filter */}
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ApplicationStatus | "all");
                  setCurrentPage(1);
                }}
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {/* Tier filter */}
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {TIER_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk actions (visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-md bg-ink-50 p-3">
              <span className="text-sm font-medium text-ink-700">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("approve")}
                className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                className="rounded-md bg-clay-100 px-3 py-1.5 text-sm font-medium text-clay-700 hover:bg-clay-200 transition-colors"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="ml-auto text-sm text-ink-400 hover:text-ink-600"
              >
                Clear
              </button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && selectedIds.length === paginatedItems.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Name
                      {sortField === "name" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors hidden sm:table-cell"
                    onClick={() => handleSort("tier")}
                  >
                    <span className="flex items-center gap-1">
                      Tier
                      {sortField === "tier" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500 hidden md:table-cell">
                    Chapter
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <span className="flex items-center gap-1">
                      Status
                      {sortField === "status" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors hidden sm:table-cell"
                    onClick={() => handleSort("reference")}
                  >
                    <span className="flex items-center gap-1">
                      Reference
                      {sortField === "reference" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-ink-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedItems.map((app) => (
                  <tr key={app.reference} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.reference)}
                        onChange={() => toggleSelect(app.reference)}
                        className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{app.name}</p>
                      <p className="text-xs text-ink-400">{app.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-medium text-ink-600">{app.tier}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-600">
                      {app.chapter.length > 20 ? `${app.chapter.slice(0, 20)}…` : app.chapter}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-ink-400 font-mono text-xs">
                      {app.reference}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.reference}`}
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

          {/* Empty state */}
          {paginatedItems.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-ink-400">No applications match your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
              <p className="text-xs text-ink-400">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-3 py-1 text-sm text-ink-400 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) page = currentPage - 2 + i;
                    if (page > totalPages) page = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md px-3 py-1 text-sm transition-colors ${
                        currentPage === page
                          ? "bg-ink-900 text-white"
                          : "text-ink-600 hover:bg-ink-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-3 py-1 text-sm text-ink-400 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

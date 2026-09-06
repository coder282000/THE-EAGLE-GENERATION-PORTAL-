"use client";

import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockAuditLogs } from "@/components/mock/data";

type SortField = "timestamp" | "actor" | "action" | "entity";
type SortDirection = "asc" | "desc";
type ActionType = 
  | "APPROVED_APPLICATION" 
  | "UPDATED_PROFILE" 
  | "CREATED_ANNOUNCEMENT" 
  | "ADDED_MEMBER" 
  | "VIEWED_APPLICATION" 
  | "UPDATED_CHAPTER";

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "APPROVED_APPLICATION", label: "Approved Application" },
  { value: "UPDATED_PROFILE", label: "Updated Profile" },
  { value: "CREATED_ANNOUNCEMENT", label: "Created Announcement" },
  { value: "ADDED_MEMBER", label: "Added Member" },
  { value: "VIEWED_APPLICATION", label: "Viewed Application" },
  { value: "UPDATED_CHAPTER", label: "Updated Chapter" },
];

// Action icon mapping
const actionIcons: Record<string, string> = {
  APPROVED_APPLICATION: "✅",
  UPDATED_PROFILE: "📝",
  CREATED_ANNOUNCEMENT: "📢",
  ADDED_MEMBER: "👤",
  VIEWED_APPLICATION: "👁️",
  UPDATED_CHAPTER: "🏛️",
};

// Action colour mapping
const actionColors: Record<string, string> = {
  APPROVED_APPLICATION: "text-green-700 bg-green-50",
  UPDATED_PROFILE: "text-sky-700 bg-sky-50",
  CREATED_ANNOUNCEMENT: "text-dawn-700 bg-dawn-50",
  ADDED_MEMBER: "text-indigo-700 bg-indigo-50",
  VIEWED_APPLICATION: "text-gray-700 bg-gray-50",
  UPDATED_CHAPTER: "text-purple-700 bg-purple-50",
};

export default function AuditLogPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 10;

  // Filter and sort logs
  const filteredAndSorted = useMemo(() => {
    let result = [...mockAuditLogs];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (log) =>
          log.actor.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.entity.toLowerCase().includes(query) ||
          (log.details && log.details.toLowerCase().includes(query))
      );
    }

    // Action filter
    if (actionFilter !== "all") {
      result = result.filter((log) => log.action === actionFilter);
    }

    // Date filter - from
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((log) => new Date(log.timestamp) >= from);
    }

    // Date filter - to
    if (dateTo) {
      const to = new Date(dateTo);
      // Set to end of day
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.timestamp) <= to);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortField) {
        case "timestamp":
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case "actor":
          aVal = a.actor;
          bVal = b.actor;
          break;
        case "action":
          aVal = a.action;
          bVal = b.action;
          break;
        case "entity":
          aVal = a.entity;
          bVal = b.entity;
          break;
        default:
          aVal = a.timestamp;
          bVal = b.timestamp;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, actionFilter, sortField, sortDirection, dateFrom, dateTo]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = {
    total: mockAuditLogs.length,
    byAction: mockAuditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    alert("📥 Exporting audit log as CSV...");
    // In production, this would generate and download a CSV
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Format timestamp
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || actionFilter !== "all" || dateFrom || dateTo;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Audit Log
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Track all administrative actions for compliance and security.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={handleExport}>
              📥 Export
            </Button>
            <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-lg bg-white p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-400">Total</p>
          </div>
          {Object.entries(stats.byAction).slice(0, 5).map(([action, count]) => (
            <div key={action} className="rounded-lg bg-ink-50 p-4 text-center shadow-card">
              <p className="text-xl font-semibold text-ink-700">{count}</p>
              <p className="text-xs text-ink-400 truncate" title={action.replace(/_/g, " ")}>
                {action.replace(/_/g, " ")}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
                <input
                  type="text"
                  placeholder="Search by actor, action, or entity..."
                  className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Action filter */}
                <select
                  className="rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {ACTION_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date range filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-ink-400">Date Range:</span>
              <input
                type="date"
                className="rounded-md border border-ink-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="text-xs text-ink-400">to</span>
              <input
                type="date"
                className="rounded-md border border-ink-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-clay-500 hover:text-clay-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-ink-400">
              Showing {totalItems} result{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50">
                <tr>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors whitespace-nowrap"
                    onClick={() => handleSort("timestamp")}
                  >
                    <span className="flex items-center gap-1">
                      Timestamp
                      {sortField === "timestamp" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors whitespace-nowrap"
                    onClick={() => handleSort("actor")}
                  >
                    <span className="flex items-center gap-1">
                      Actor
                      {sortField === "actor" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors whitespace-nowrap"
                    onClick={() => handleSort("action")}
                  >
                    <span className="flex items-center gap-1">
                      Action
                      {sortField === "action" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors whitespace-nowrap"
                    onClick={() => handleSort("entity")}
                  >
                    <span className="flex items-center gap-1">
                      Entity
                      {sortField === "entity" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-ink-500 whitespace-nowrap">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedItems.map((log) => (
                  <tr key={log.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{log.actor}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[log.action] || "bg-ink-50 text-ink-600"}`}
                      >
                        {actionIcons[log.action] || "📋"}
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 max-w-[150px] truncate">
                      {log.entity}
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs max-w-[200px] truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {paginatedItems.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-ink-400">No audit logs match your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between border-t border-ink-100 px-4 py-3 gap-2">
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockMembers, Member } from "@/components/mock/data";

type SortField = "name" | "memberNumber" | "tier" | "chapter" | "status" | "joinedAt";
type SortDirection = "asc" | "desc";

const TIER_FILTERS = [
  { value: "all", label: "All Tiers" },
  { value: "Eagle", label: "🦅 Eagle" },
  { value: "Rising", label: "⬆️ Rising" },
  { value: "Nestling", label: "🐣 Nestling" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "✅ Active" },
  { value: "pending", label: "⏳ Pending" },
  { value: "inactive", label: "⛔ Inactive" },
];

export default function AdminMembersPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("joinedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 10;

  // Filter and sort members
  const filteredAndSorted = useMemo(() => {
    let result = [...mockMembers];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.memberNumber.toLowerCase().includes(query) ||
          m.chapter.toLowerCase().includes(query)
      );
    }

    // Tier filter
    if (tierFilter !== "all") {
      result = result.filter((m) => m.tier === tierFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortField) {
        case "name":
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
          break;
        case "memberNumber":
          aVal = a.memberNumber;
          bVal = b.memberNumber;
          break;
        case "tier":
          aVal = a.tier;
          bVal = b.tier;
          break;
        case "chapter":
          aVal = a.chapter;
          bVal = b.chapter;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "joinedAt":
          aVal = new Date(a.joinedAt).getTime();
          bVal = new Date(b.joinedAt).getTime();
          break;
        default:
          aVal = a.memberNumber;
          bVal = b.memberNumber;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, tierFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = {
    total: mockMembers.length,
    active: mockMembers.filter((m) => m.status === "active").length,
    pending: mockMembers.filter((m) => m.status === "pending").length,
    inactive: mockMembers.filter((m) => m.status === "inactive").length,
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

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map((m) => m.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    const count = selectedIds.length;
    if (count === 0) return;
    const actionLabels = {
      activate: "activated",
      deactivate: "deactivated",
      delete: "deleted",
    };
    // In production, this would call an API
    alert(`✅ ${count} member${count > 1 ? "s" : ""} ${actionLabels[action]}.`);
    setSelectedIds([]);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      alert(`✅ Member deleted.`);
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-50 text-green-700",
      pending: "bg-dawn-50 text-dawn-700",
      inactive: "bg-gray-100 text-gray-600",
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
              Members
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Manage all Eagle Generation members.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => alert("📥 Exporting members...")}>
              📥 Export
            </Button>
            <Button variant="primary" size="md" onClick={() => alert("➕ Add member form would open here.")}>
              ➕ Add Member
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-400">Total</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-green-700">{stats.active}</p>
            <p className="text-xs text-green-500">Active</p>
          </div>
          <div className="rounded-lg bg-dawn-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-dawn-700">{stats.pending}</p>
            <p className="text-xs text-dawn-500">Pending</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-gray-600">{stats.inactive}</p>
            <p className="text-xs text-gray-500">Inactive</p>
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
                placeholder="Search by name, email, member number, or chapter..."
                className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
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
              {/* Status filter */}
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-md bg-ink-50 p-3 flex-wrap">
              <span className="text-sm font-medium text-ink-700">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("activate")}
                className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
              >
                ✅ Activate
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ⛔ Deactivate
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="rounded-md bg-clay-100 px-3 py-1.5 text-sm font-medium text-clay-700 hover:bg-clay-200 transition-colors"
              >
                🗑️ Delete
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
                      Member
                      {sortField === "name" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors hidden sm:table-cell"
                    onClick={() => handleSort("memberNumber")}
                  >
                    <span className="flex items-center gap-1">
                      Number
                      {sortField === "memberNumber" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors hidden md:table-cell"
                    onClick={() => handleSort("tier")}
                  >
                    <span className="flex items-center gap-1">
                      Tier
                      {sortField === "tier" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-ink-500 cursor-pointer hover:text-ink-700 transition-colors hidden lg:table-cell"
                    onClick={() => handleSort("chapter")}
                  >
                    <span className="flex items-center gap-1">
                      Chapter
                      {sortField === "chapter" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
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
                  <th className="px-4 py-3 text-right font-medium text-ink-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedItems.map((member) => (
                  <tr key={member.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(member.id)}
                        onChange={() => toggleSelect(member.id)}
                        className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-ink-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-ink-500">
                      {member.memberNumber}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-medium text-ink-600">{member.tier}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-ink-600">
                      {member.chapter}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/profile/${member.id}`}
                          className="text-xs font-medium text-sky-600 hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/members/${member.id}/edit`}
                          className="text-xs font-medium text-ink-500 hover:text-ink-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-xs font-medium text-clay-500 hover:text-clay-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {paginatedItems.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-ink-400">No members match your filters.</p>
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

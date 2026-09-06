"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { mockBlockedUsers, type BlockedUser } from "@/components/mock/data";

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setBlockedUsers(mockBlockedUsers);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle unblock
  const handleUnblock = (user: BlockedUser) => {
    if (!confirm(`Are you sure you want to unblock ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    setUnblockingId(user.id);
    // Simulate API call
    setTimeout(() => {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setUnblockingId(null);
    }, 800);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile/me"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
          >
            ← Back to Profile
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-900 mt-2">
            Blocked Users
          </h1>
          <p className="text-ink-500 mt-1">
            Manage users you have blocked. Unblock them to restore communication.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3" aria-live="polite">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-ink-100 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ink-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-ink-200 rounded w-32" />
                    <div className="h-3 bg-ink-100 rounded w-24" />
                  </div>
                </div>
                <div className="h-8 bg-ink-200 rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blockedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😊</div>
            <p className="text-ink-500 text-lg">You haven't blocked anyone.</p>
            <p className="text-sm text-ink-400 mt-2">
              If you encounter issues with other members, you can block them from their profile.
            </p>
          </div>
        )}

        {/* Populated State */}
        {!isLoading && blockedUsers.length > 0 && (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-ink-100 rounded-lg hover:border-ink-200 transition"
              >
                <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-0">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-dawn-200 flex items-center justify-center text-ink-700 font-semibold flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-ink-400">{user.email}</p>
                    {user.reason && (
                      <p className="text-xs text-ink-500 mt-1">
                        Reason: <span className="text-clay-600">{user.reason}</span>
                      </p>
                    )}
                    <p className="text-xs text-ink-400 mt-0.5">
                      Blocked: {formatDate(user.blockedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleUnblock(user)}
                  disabled={unblockingId === user.id}
                  className="w-full sm:w-auto"
                >
                  {unblockingId === user.id ? "Unblocking..." : "Unblock"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}

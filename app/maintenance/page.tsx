"use client";

import { useState, useEffect } from "react";
import { StatusPage } from "@/components/status/statuspage";

export default function MaintenancePage() {
  // Mock estimated completion time (2 hours from now)
  const [estimatedTime, setEstimatedTime] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const estimated = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    setEstimatedTime(
      estimated.toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, []);

  return (
    <StatusPage
      title="Scheduled Maintenance"
      message="We're currently performing scheduled maintenance to improve your experience. The site will be back online shortly."
      emoji="🔧"
      actions={[
        { label: "Check Status Updates", href: "/announcements", variant: "primary" },
        { label: "Go Home", href: "/", variant: "secondary" },
      ]}
    >
      <div className="bg-dawn-50 border border-dawn-200 rounded-lg p-4 max-w-sm mx-auto">
        <p className="text-sm text-ink-700">
          Estimated completion:{" "}
          <span className="font-semibold">{estimatedTime || "Loading..."}</span>
        </p>
        <p className="text-xs text-ink-500 mt-1">
          We'll notify you when we're back online.
        </p>
      </div>
    </StatusPage>
  );
}
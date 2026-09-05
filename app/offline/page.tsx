"use client";

import { useState } from "react";
import { StatusPage } from "@/components/status/statuspage";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate checking internet connection
    setTimeout(() => {
      setIsRetrying(false);
      // In a real scenario, you'd check navigator.onLine or ping a health endpoint
      if (navigator.onLine) {
        window.location.reload();
      } else {
        alert("Still offline. Please check your connection.");
      }
    }, 1500);
  };

  return (
    <StatusPage
      title="You Are Offline"
      message="Please check your internet connection and try again. Some features may be unavailable while you're offline."
      emoji="📡"
      actions={[
        { label: isRetrying ? "Checking..." : "Retry", href: "#", variant: "primary" },
        { label: "Go Home", href: "/", variant: "secondary" },
      ]}
    >
      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="px-6 py-2.5 bg-sky-600 text-white rounded-md font-medium hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        {isRetrying ? "Checking..." : "Retry"}
      </button>
      <p className="text-sm text-ink-400 mt-4">
        You can also try refreshing the page or checking your network settings.
      </p>
    </StatusPage>
  );
}
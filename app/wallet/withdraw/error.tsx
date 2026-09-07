"use client";

import { useEffect } from "react";
import { Button } from "@/components/button";

export default function WithdrawError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Withdrawal error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h2 className="text-lg font-semibold text-red-700">Unable to process withdrawal</h2>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
        <Button variant="primary" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
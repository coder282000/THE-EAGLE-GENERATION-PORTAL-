"use client";
import { Button } from "@/components/button";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div className="p-6"><h2 className="text-lg font-semibold text-ink">Could not load system health</h2><Button variant="primary" className="mt-4" onClick={reset}>Retry</Button></div>;
}
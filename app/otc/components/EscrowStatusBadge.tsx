"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

type EscrowStatus = "PENDING" | "ACTIVE" | "RELEASED" | "DISPUTED";

export function EscrowStatusBadge({ status }: { status: EscrowStatus }) {
  const config: Record<EscrowStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PENDING: {
      label: "Pending",
      color: "text-clay",
      bg: "bg-clay/10",
      icon: <Shield className="w-4 h-4" />,
    },
    ACTIVE: {
      label: "Active",
      color: "text-sky-600",
      bg: "bg-sky-100",
      icon: <Shield className="w-4 h-4" />,
    },
    RELEASED: {
      label: "Released",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    DISPUTED: {
      label: "Disputed",
      color: "text-red-600",
      bg: "bg-red-100",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  };

  const c = config[status] || config.PENDING;

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", c.bg, c.color)}>
      {c.icon}
      {c.label}
    </span>
  );
}
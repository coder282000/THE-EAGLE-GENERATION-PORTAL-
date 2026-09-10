// components/admin/StatCard.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminStat } from "@/components/mock/data";

interface StatCardProps {
  stat: AdminStat;
}

const iconMap: Record<AdminStat["icon"], string> = {
  members: "👥",
  applications: "📋",
  chapters: "🏛️",
  revenue: "💰",
};

export function StatCard({ stat }: StatCardProps) {
  const trendColor =
    stat.trend === "up"
      ? "text-emerald-600"
      : stat.trend === "down"
      ? "text-rose-600"
      : "text-ink/60";

  return (
    <Link
      href={stat.href}
      className="group block bg-white rounded-lg border border-ink/10 shadow-sm p-5 transition-all hover:border-sky/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink/60 truncate">{stat.label}</p>
          <p className="text-2xl font-bold text-ink mt-1">{stat.value}</p>
          <p className={cn("text-sm mt-1 font-medium", trendColor)}>
            {stat.change}
          </p>
        </div>
        <span className="text-3xl shrink-0" aria-hidden="true">
          {iconMap[stat.icon]}
        </span>
      </div>
    </Link>
  );
}
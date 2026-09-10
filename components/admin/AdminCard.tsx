// components/admin/AdminCard.tsx
import { cn } from "@/lib/utils";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function AdminCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  padding = "md",
}: AdminCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-ink/10 shadow-sm",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span className="text-sky shrink-0" aria-hidden="true">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-semibold text-ink truncate">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-ink/60 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
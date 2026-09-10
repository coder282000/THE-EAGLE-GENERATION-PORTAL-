// components/admin/FilterBar.tsx
import { Button } from "@/components/button";

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterBarProps {
  filters: FilterOption[];
  onFilterChange: (key: string, value: string) => void;
  onSearch: (query: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  onExport,
  onRefresh,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-paper rounded-lg border border-ink/10">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/50"
        />
      </div>
      {filters.map((filter) => (
        <select
          key={filter.key}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="px-3 py-2 bg-white border border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sky/50"
        >
          <option value="">All {filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      <div className="flex gap-2 ml-auto">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            🔄 Refresh
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            📥 Export
          </Button>
        )}
      </div>
    </div>
  );
}
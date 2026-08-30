"use client";

import { ReactNode } from "react";

const PILLAR_STYLES: Record<string, string> = {
  Marketplace: "bg-dawn-50 text-dawn-700 border-dawn-200",
  Governance: "bg-sky-50 text-sky-700 border-sky-100",
  Technology: "bg-ink-100 text-ink-700 border-ink-200",
};

export function PillarTag({ pillar }: { pillar: "Marketplace" | "Governance" | "Technology" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${PILLAR_STYLES[pillar]}`}>
      {pillar}
    </span>
  );
}

interface TierCardProps {
  name: string;
  age: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function TierCard({ name, age, description, selected, onSelect }: TierCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full text-left rounded-lg border p-4 transition-all duration-150
        ${selected ? "border-ink-900 bg-ink-900 shadow-raised" : "border-ink-200 bg-white hover:border-ink-400"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-display font-semibold text-[15px] ${selected ? "text-white" : "text-ink-900"}`}>{name}</p>
          <p className={`text-[13px] mt-0.5 ${selected ? "text-ink-300" : "text-ink-400"}`}>{age}</p>
        </div>
        <div
          className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center
            ${selected ? "border-dawn-400 bg-dawn-400" : "border-ink-200"}`}
        >
          {selected && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#141B2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <p className={`text-[13.5px] mt-2 leading-relaxed ${selected ? "text-ink-200" : "text-ink-500"}`}>{description}</p>
    </button>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-paper flex flex-col">{children}</div>;
}
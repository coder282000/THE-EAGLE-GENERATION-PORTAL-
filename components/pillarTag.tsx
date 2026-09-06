const PILLAR_STYLES: Record<string, string> = {
  marketplace: "bg-dawn-50 text-dawn-700 border-dawn-200",
  governance: "bg-sky-50 text-sky-700 border-sky-100",
  technology: "bg-ink-100 text-ink-700 border-ink-200",
};

interface PillarTagProps {
  pillar: "marketplace" | "governance" | "technology";
}

export function PillarTag({ pillar }: PillarTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${PILLAR_STYLES[pillar]}`}
    >
      {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
    </span>
  );
}

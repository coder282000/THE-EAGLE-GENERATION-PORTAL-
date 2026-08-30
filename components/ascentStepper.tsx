export type StepState = "complete" | "current" | "upcoming";

export interface Step {
  label: string;
  state: StepState;
}

interface AscentStepperProps {
  steps: Step[];
  currentIndex?: number;
}

export function AscentStepper({ steps, currentIndex }: AscentStepperProps) {
  // If currentIndex is provided, auto-derive states
  const derivedSteps: Step[] = currentIndex !== undefined
    ? steps.map((step, i) => ({
        label: step.label,
        state: i < currentIndex ? "complete" : i === currentIndex ? "current" : "upcoming",
      }))
    : steps;

  const n = derivedSteps.length;
  const width = 100;
  const startY = 78;
  const endY = 18;

  // Calculate points along an upward curve
  const points = derivedSteps.map((_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const x = 6 + t * (width - 12);
    const eased = 1 - Math.pow(1 - t, 1.6);
    const y = startY - eased * (startY - endY);
    return { x, y };
  });

  const fullPathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const lastActiveIdx = derivedSteps.reduce(
    (acc, s, i) => (s.state === "complete" || s.state === "current" ? i : acc),
    0
  );
  const progressT = n === 1 ? 1 : lastActiveIdx / (n - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} 90`} className="w-full h-auto" aria-hidden="true">
        {/* Background path */}
        <path d={fullPathD} stroke="#E4E8F0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Progress path (animated) */}
        <path
          d={fullPathD}
          stroke="#E29B3D"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset={200 - 200 * progressT}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        {/* Dots */}
        {points.map((p, i) => {
          const state = derivedSteps[i].state;
          return (
            <g key={i}>
              {state === "current" && (
                <circle cx={p.x} cy={p.y} r="5.5" fill="#FDF6EC" stroke="#E29B3D" strokeWidth="1.2" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={state === "current" ? 2.6 : 2.2}
                fill={state === "complete" ? "#E29B3D" : state === "current" ? "#E29B3D" : "#C3CBDC"}
              />
            </g>
          );
        })}
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-1.5 gap-1">
        {derivedSteps.map((step, i) => {
          let textColor = "text-ink-300";
          if (step.state === "complete") textColor = "text-ink-500";
          if (step.state === "current") textColor = "text-dawn-700";
          return (
            <span key={i} className={`text-[11px] leading-tight font-medium text-center flex-1 ${textColor}`}>
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
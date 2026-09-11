import type { RiskLevel } from "@/lib/agility/types";

const LEVEL_LABEL: Record<RiskLevel, string> = {
  LOW: "BAJO",
  MEDIUM: "MEDIO",
  HIGH: "ALTO",
};

const LEVEL_STROKE: Record<RiskLevel, string> = {
  LOW: "var(--risk-low)",
  MEDIUM: "var(--risk-medium)",
  HIGH: "var(--risk-high)",
};

interface Props {
  probability: number;
  level: RiskLevel;
  size?: number;
}

/** Gauge circular de probabilidad de incumplimiento. */
export function RiskGauge({ probability, level, size = 180 }: Props) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, probability));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={12}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={12}
          strokeLinecap="round"
          stroke={LEVEL_STROKE[level]}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: "stroke-dashoffset 900ms ease, stroke 400ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
          {Math.round(pct * 100)}%
        </span>
        <span
          className="mt-1 text-xs font-semibold tracking-widest"
          style={{ color: LEVEL_STROKE[level] }}
        >
          {LEVEL_LABEL[level]}
        </span>
      </div>
    </div>
  );
}

export function RiskChip({ level }: { level: RiskLevel }) {
  const cls =
    level === "HIGH"
      ? "bg-risk-high-soft text-risk-high"
      : level === "MEDIUM"
        ? "bg-risk-medium-soft text-risk-medium"
        : "bg-risk-low-soft text-risk-low";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider ${cls}`}>
      {LEVEL_LABEL[level]}
    </span>
  );
}

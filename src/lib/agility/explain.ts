/**
 * Capa de explicación desacoplada.
 *
 * El LLM NUNCA calcula el riesgo: solo redacta la explicación a partir de los
 * factores entregados por el modelo. Si no hay backend/LLM configurado se usa
 * una explicación determinística basada en reglas y en los factores reales.
 */
import type { RiskFactor, RiskLevel } from "./types";

const LEVEL_ES: Record<RiskLevel, string> = {
  LOW: "bajo",
  MEDIUM: "medio",
  HIGH: "alto",
};

export function buildRuleExplanation(
  probability: number,
  level: RiskLevel,
  factors: RiskFactor[],
): string {
  const up = factors.filter((f) => f.effect === "increases_risk").slice(0, 2);
  const down = factors.find((f) => f.effect === "reduces_risk");
  const pct = Math.round(probability * 100);

  const causes =
    up.length > 0
      ? up.map((f) => `${f.label.toLowerCase()} (${f.value})`).join(" y ")
      : "las condiciones generales de la tarea";

  const mitigation = down ? ` A favor: ${down.label.toLowerCase()} (${down.value}).` : "";

  return `Esta tarea presenta un riesgo ${LEVEL_ES[level]} de incumplimiento (${pct} %), explicado principalmente por ${causes}.${mitigation} ${recommendedAction(level, factors)}`;
}

export function recommendedAction(level: RiskLevel, factors: RiskFactor[]): string {
  const hasShortDeadline = factors.some(
    (f) => f.feature === "days_available" && f.effect === "increases_risk",
  );
  const hasLoad = factors.some(
    (f) =>
      (f.feature === "executor_open_tasks" || f.feature === "executor_tasks_last_30_days") &&
      f.effect === "increases_risk",
  );

  if (level === "HIGH") {
    if (hasShortDeadline && hasLoad)
      return "Evaluar redistribución de carga o ampliación del plazo antes de confirmar la asignación.";
    if (hasLoad) return "Revisar la carga del ejecutor y considerar reasignar la tarea.";
    if (hasShortDeadline) return "Ampliar el plazo o priorizar la tarea con seguimiento diario.";
    return "Asignar seguimiento prioritario antes del vencimiento.";
  }
  if (level === "MEDIUM") {
    return "Realizar seguimiento intermedio y confirmar disponibilidad del ejecutor.";
  }
  return "Sin acción inmediata: mantener el seguimiento estándar.";
}

/** Datos anonimizados que se enviarían al LLM (sin nombres reales ni textos sensibles). */
export function buildLlmPayload(
  probability: number,
  level: RiskLevel,
  factors: RiskFactor[],
  extra: Record<string, number>,
) {
  return {
    risk_probability: Number(probability.toFixed(4)),
    risk_level: level,
    main_factors: factors.map((f) => ({
      feature: f.feature,
      value: f.value,
      effect: f.effect,
    })),
    ...extra,
  };
}

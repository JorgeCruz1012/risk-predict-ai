/**
 * Cliente de la API Agility Risk AI.
 *
 * Si existe VITE_API_BASE_URL (backend FastAPI), se usan los endpoints reales
 * (POST /api/predict, POST /api/predict/simulate). En caso contrario el
 * frontend ejecuta el modelo local de respaldo con datos DEMO.
 */
import { buildRuleExplanation, recommendedAction } from "./explain";
import { DEFAULT_THRESHOLDS, MODEL_VERSION, predictLocal, riskLevel } from "./model";
import type { PredictionResponse, RiskThresholds, TaskInput } from "./types";

const BASE_URL = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

/** Indica si la app está funcionando con datos DEMO (sin backend conectado). */
export const isDemoMode = !BASE_URL;

function localPredict(
  input: TaskInput,
  thresholds: RiskThresholds,
  taskId: string,
): PredictionResponse {
  const { probability, features, factors } = predictLocal(input);
  const level = riskLevel(probability, thresholds);
  return {
    taskId,
    riskProbability: probability,
    riskLevel: level,
    threshold: thresholds.high,
    daysAvailable: features.daysAvailable,
    executorOpenTasks: features.executorOpenTasks,
    executorHistoricalLateRate: features.executorHistoricalLateRate,
    executorTasksLast30Days: features.executorTasksLast30Days,
    mainFactors: factors,
    explanation: buildRuleExplanation(probability, level, factors),
    explanationSource: "rules",
    recommendedAction: recommendedAction(level, factors),
    modelVersion: MODEL_VERSION,
  };
}

export async function predict(
  input: TaskInput,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
  taskId = `MVP-${Date.now().toString().slice(-6)}`,
): Promise<PredictionResponse> {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, thresholds }),
      });
      if (res.ok) return (await res.json()) as PredictionResponse;
    } catch {
      // Backend no disponible: se continúa con el modelo local.
    }
  }
  // Pequeña latencia para reflejar el análisis en la interfaz.
  await new Promise((r) => setTimeout(r, 650));
  return localPredict(input, thresholds, taskId);
}

/** Simulación what-if: misma tarea con condiciones modificadas. */
export async function simulate(
  input: TaskInput,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): Promise<PredictionResponse> {
  return predict(input, thresholds, "SIM-what-if");
}

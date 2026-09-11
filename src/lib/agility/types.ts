/**
 * Tipos compartidos del dominio Agility Risk AI.
 * Estas estructuras replican el contrato de la API prevista (FastAPI)
 * para que el frontend pueda conectarse sin cambios en los componentes.
 */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

/** Entrada del formulario "Nueva predicción" (solo datos conocidos al crear la tarea). */
export interface TaskInput {
  title: string;
  description: string;
  createdOn: string; // ISO datetime-local
  deadline: string; // ISO datetime-local
  typeTask: string;
  project: string;
  executingUser: string;
  creatorUser: string;
  executingCompany: string;
  possiblePoints: number;
}

/** Factor explicativo respaldado por el valor real de la variable. */
export interface RiskFactor {
  feature: string;
  label: string;
  value: string;
  effect: "increases_risk" | "reduces_risk";
  weight: number; // contribución absoluta normalizada 0..1
}

export interface PredictionResponse {
  taskId: string;
  riskProbability: number; // 0..1
  riskLevel: RiskLevel;
  threshold: number;
  daysAvailable: number;
  executorOpenTasks: number;
  executorHistoricalLateRate: number;
  executorTasksLast30Days: number;
  mainFactors: RiskFactor[];
  explanation: string;
  explanationSource: "llm" | "rules";
  recommendedAction: string;
  modelVersion: string;
}

export interface RiskThresholds {
  medium: number; // límite inferior de riesgo medio
  high: number; // límite inferior de riesgo alto
}

/** Registro histórico anonimizado usado para las estadísticas del modelo. */
export interface HistoricalTask {
  taskId: string;
  createdOn: string;
  deadline: string;
  typeTask: string;
  project: string;
  executingUser: string;
  possiblePoints: number;
  isLate: 0 | 1;
}

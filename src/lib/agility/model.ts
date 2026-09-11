/**
 * Modelo de inferencia local (fallback del frontend).
 *
 * Reproduce la lógica de un clasificador logístico entrenado sobre variables
 * conocidas al momento de crear la tarea. Los coeficientes están fijados y
 * documentados; en producción provienen del pipeline scikit-learn del backend.
 *
 * Variables EXCLUIDAS por fuga de información (nunca entran al modelo):
 * RealDeadLine, OnTime, Closed, PointsEarned, StatusDescription.
 */
import {
  AVG_DAYS_AVAILABLE,
  PROJECT_LATE_RATE,
  TYPE_LATE_RATE,
  executorStats,
} from "./demoData";
import type { RiskFactor, RiskLevel, RiskThresholds, TaskInput } from "./types";

export const MODEL_VERSION = "1.0-frontend-fallback";

export const LEAKAGE_FEATURES = [
  "RealDeadLine",
  "OnTime",
  "Closed",
  "PointsEarned",
  "StatusDescription",
];

export const DEFAULT_THRESHOLDS: RiskThresholds = { medium: 0.3, high: 0.6 };

export function riskLevel(p: number, t: RiskThresholds = DEFAULT_THRESHOLDS): RiskLevel {
  if (p >= t.high) return "HIGH";
  if (p >= t.medium) return "MEDIUM";
  return "LOW";
}

export interface DerivedFeatures {
  daysAvailable: number;
  creationHour: number;
  creationDayOfWeek: number;
  isWeekend: boolean;
  titleLength: number;
  descriptionLength: number;
  possiblePoints: number;
  typeLateRate: number;
  projectLateRate: number;
  executorOpenTasks: number;
  executorTasksLast30Days: number;
  executorHistoricalLateRate: number;
  executorHistoricalTaskCount: number;
}

export function buildFeatures(input: TaskInput): DerivedFeatures {
  const created = new Date(input.createdOn);
  const deadline = new Date(input.deadline);
  const daysAvailable = Math.max(
    0,
    (deadline.getTime() - created.getTime()) / 86400000,
  );
  const stats = executorStats(input.executingUser, created);
  const dow = created.getDay();

  return {
    daysAvailable,
    creationHour: created.getHours(),
    creationDayOfWeek: dow,
    isWeekend: dow === 0 || dow === 6,
    titleLength: input.title.trim().length,
    descriptionLength: input.description.trim().length,
    possiblePoints: input.possiblePoints,
    typeLateRate: TYPE_LATE_RATE[input.typeTask] ?? 0.029,
    projectLateRate: PROJECT_LATE_RATE[input.project] ?? 0.029,
    executorOpenTasks: stats.openTasksAtCreation,
    executorTasksLast30Days: stats.tasksLast30Days,
    executorHistoricalLateRate: stats.historicalLateRate,
    executorHistoricalTaskCount: stats.historicalTaskCount,
  };
}

interface Term {
  feature: string;
  label: string;
  contribution: number; // en log-odds
  value: string;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Calcula log-odds y la contribución de cada variable (explicabilidad por término). */
function score(f: DerivedFeatures) {
  const intercept = -1.35;
  const terms: Term[] = [
    {
      feature: "days_available",
      label: "Plazo disponible",
      value: `${f.daysAvailable.toFixed(1)} días (promedio histórico ${AVG_DAYS_AVAILABLE.toFixed(1)})`,
      contribution: 0.62 * (Math.log(AVG_DAYS_AVAILABLE + 1) - Math.log(f.daysAvailable + 1)),
    },
    {
      feature: "executor_open_tasks",
      label: "Carga actual del ejecutor",
      value: `${f.executorOpenTasks} tareas abiertas al crear`,
      contribution: 0.075 * (f.executorOpenTasks - 8),
    },
    {
      feature: "executor_historical_late_rate",
      label: "Incumplimiento histórico del ejecutor",
      value: `${(f.executorHistoricalLateRate * 100).toFixed(1)} %`,
      contribution: 9 * (f.executorHistoricalLateRate - 0.029),
    },
    {
      feature: "executor_tasks_last_30_days",
      label: "Tareas del ejecutor en los últimos 30 días",
      value: `${f.executorTasksLast30Days} tareas`,
      contribution: 0.05 * (f.executorTasksLast30Days - 4),
    },
    {
      feature: "type_task_late_rate",
      label: "Incumplimiento histórico del tipo de tarea",
      value: `${(f.typeLateRate * 100).toFixed(1)} %`,
      contribution: 11 * (f.typeLateRate - 0.029),
    },
    {
      feature: "project_late_rate",
      label: "Comportamiento histórico del proyecto",
      value: `${(f.projectLateRate * 100).toFixed(1)} %`,
      contribution: 8 * (f.projectLateRate - 0.029),
    },
    {
      feature: "possible_points",
      label: "Puntos asignados (esfuerzo estimado)",
      value: `${f.possiblePoints} puntos`,
      contribution: 0.09 * (f.possiblePoints - 3),
    },
    {
      feature: "is_weekend",
      label: "Creación en fin de semana",
      value: f.isWeekend ? "Sí" : "No",
      contribution: f.isWeekend ? 0.35 : -0.05,
    },
    {
      feature: "creation_hour",
      label: "Hora de creación",
      value: `${String(f.creationHour).padStart(2, "0")}:00`,
      contribution: f.creationHour >= 16 ? 0.22 : -0.04,
    },
    {
      feature: "description_length",
      label: "Detalle de la descripción",
      value: `${f.descriptionLength} caracteres`,
      contribution: f.descriptionLength < 40 ? 0.28 : -0.12,
    },
    {
      feature: "title_length",
      label: "Longitud del título",
      value: `${f.titleLength} caracteres`,
      contribution: f.titleLength < 15 ? 0.15 : -0.05,
    },
  ];

  const z = intercept + terms.reduce((acc, t) => acc + t.contribution, 0);
  return { z, probability: sigmoid(z), terms };
}

export interface LocalPrediction {
  probability: number;
  features: DerivedFeatures;
  factors: RiskFactor[];
}

export function predictLocal(input: TaskInput): LocalPrediction {
  const features = buildFeatures(input);
  const { probability, terms } = score(features);

  const sorted = [...terms].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const max = Math.abs(sorted[0]?.contribution ?? 1) || 1;
  const factors: RiskFactor[] = sorted
    .filter((t) => Math.abs(t.contribution) > 0.02)
    .slice(0, 5)
    .map((t) => ({
      feature: t.feature,
      label: t.label,
      value: t.value,
      effect: t.contribution > 0 ? "increases_risk" : "reduces_risk",
      weight: Math.min(1, Math.abs(t.contribution) / max),
    }));

  return { probability, features, factors };
}

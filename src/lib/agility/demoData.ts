/**
 * Datos DEMO anonimizados (~200 tareas) generados de forma determinística.
 * Sustituyen al histórico real mientras no se conecte el backend.
 * Nunca contienen nombres reales.
 */
import type { HistoricalTask } from "./types";

export const TASK_TYPES = ["Impacto", "Actividad", "Solicitud", "Seguimiento"];
export const PROJECTS = ["Proyecto A", "Proyecto B", "Operación", "Otros"];
export const COMPANIES = ["Empresa_01", "Empresa_02", "Empresa_03"];

export const EXECUTORS = Array.from(
  { length: 20 },
  (_, i) => `Ejecutor_${String(i + 1).padStart(3, "0")}`,
);
export const CREATORS = Array.from(
  { length: 8 },
  (_, i) => `Usuario_${String(i + 1).padStart(3, "0")}`,
);

/** PRNG determinístico (mulberry32) para que la demo sea reproducible. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(): HistoricalTask[] {
  const rand = rng(20240823);
  const tasks: HistoricalTask[] = [];
  const start = new Date("2024-08-01T08:00:00").getTime();
  const end = new Date("2025-11-30T18:00:00").getTime();

  for (let i = 0; i < 200; i++) {
    const createdOn = new Date(start + rand() * (end - start));
    const days = 1 + Math.floor(rand() * 14);
    const deadline = new Date(createdOn.getTime() + days * 86400000);
    const typeTask = TASK_TYPES[Math.floor(rand() * TASK_TYPES.length)]!;
    const project = PROJECTS[Math.floor(rand() * PROJECTS.length)]!;
    const executingUser = EXECUTORS[Math.floor(rand() * EXECUTORS.length)]!;

    // Probabilidad de incumplimiento coherente: plazos cortos y tipo "Impacto" fallan más.
    let p = 0.02;
    if (days <= 2) p += 0.06;
    if (typeTask === "Impacto") p += 0.03;
    if (project === "Otros") p += 0.02;
    const isLate: 0 | 1 = rand() < p ? 1 : 0;

    tasks.push({
      taskId: `DEMO-${String(i + 1).padStart(4, "0")}`,
      createdOn: createdOn.toISOString(),
      deadline: deadline.toISOString(),
      typeTask,
      project,
      executingUser,
      possiblePoints: [1, 2, 3, 5, 8][Math.floor(rand() * 5)]!,
      isLate,
    });
  }
  return tasks.sort((a, b) => a.createdOn.localeCompare(b.createdOn));
}

export const DEMO_TASKS: HistoricalTask[] = generate();

/** Indicadores reales reportados del histórico Agility (contexto del proyecto). */
export const PROBLEM_STATS = {
  totalTasks: 52635,
  lateTasks: 1522,
  latePercent: 2.89,
  executors: 233,
};

function rate(subset: HistoricalTask[]) {
  if (subset.length === 0) return 0.029;
  return subset.filter((t) => t.isLate === 1).length / subset.length;
}

/** Tasa histórica de incumplimiento por tipo de tarea (solo datos demo). */
export const TYPE_LATE_RATE: Record<string, number> = Object.fromEntries(
  TASK_TYPES.map((t) => [t, rate(DEMO_TASKS.filter((x) => x.typeTask === t))]),
);

export const PROJECT_LATE_RATE: Record<string, number> = Object.fromEntries(
  PROJECTS.map((p) => [p, rate(DEMO_TASKS.filter((x) => x.project === p))]),
);

export interface ExecutorStats {
  historicalTaskCount: number;
  historicalLateRate: number;
  tasksLast30Days: number;
  openTasksAtCreation: number;
}

/**
 * Estadísticas del ejecutor calculadas SOLO con tareas anteriores a `reference`.
 * Evita contaminación temporal (data leakage).
 */
export function executorStats(executor: string, reference: Date): ExecutorStats {
  // Si la fecha consultada es posterior al histórico demo, se evalúa contra el
  // último corte disponible para que la carga siga siendo representativa.
  const datasetEnd = new Date(DEMO_TASKS[DEMO_TASKS.length - 1]!.createdOn).getTime();
  const ref = Math.min(reference.getTime(), datasetEnd);
  const prior = DEMO_TASKS.filter(
    (t) => t.executingUser === executor && new Date(t.createdOn).getTime() < ref,
  );
  const last30 = prior.filter((t) => ref - new Date(t.createdOn).getTime() <= 30 * 86400000);
  const open = prior.filter((t) => new Date(t.deadline).getTime() >= ref);
  return {
    historicalTaskCount: prior.length,
    historicalLateRate: prior.length >= 5 ? rate(prior) : 0.029,
    tasksLast30Days: last30.length,
    // La demo tiene menos volumen que el histórico real: escalamos la carga abierta.
    openTasksAtCreation: open.length * 3 + (last30.length > 0 ? 2 : 0),
  };
}

export const AVG_DAYS_AVAILABLE =
  DEMO_TASKS.reduce(
    (acc, t) =>
      acc + (new Date(t.deadline).getTime() - new Date(t.createdOn).getTime()) / 86400000,
    0,
  ) / DEMO_TASKS.length;

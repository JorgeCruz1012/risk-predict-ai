import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  Layers,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/agility/AppShell";
import { RiskChip, RiskGauge } from "@/components/agility/RiskGauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { predict, simulate } from "@/lib/agility/api";
import { LEAKAGE_FEATURES } from "@/lib/agility/model";
import {
  COMPANIES,
  CREATORS,
  EXECUTORS,
  PROJECTS,
  TASK_TYPES,
} from "@/lib/agility/demoData";
import type { PredictionResponse, TaskInput } from "@/lib/agility/types";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Nueva predicción — Agility Risk AI" },
      {
        name: "description",
        content:
          "Estima el riesgo de incumplimiento de una tarea nueva, revisa los factores que lo explican y simula escenarios alternativos.",
      },
      { property: "og:title", content: "Nueva predicción — Agility Risk AI" },
      {
        property: "og:description",
        content: "Riesgo de incumplimiento, factores explicativos y simulación what-if.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PredictionPage,
});

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Tarea demo precargada para la primera experiencia del usuario. */
function demoTask(): TaskInput {
  const now = new Date();
  const deadline = new Date(now.getTime() + 2 * 86400000);
  return {
    title: "Ajuste de parametrización en flujo de aprobación",
    description:
      "Revisar y ajustar la parametrización del flujo de aprobación para el cierre operativo del periodo.",
    createdOn: toLocalInput(now),
    deadline: toLocalInput(deadline),
    typeTask: "Impacto",
    project: "Operación",
    executingUser: "Ejecutor_017",
    creatorUser: "Usuario_002",
    executingCompany: "Empresa_01",
    possiblePoints: 5,
  };
}

function PredictionPage() {
  const [form, setForm] = useState<TaskInput>(demoTask);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const [simDays, setSimDays] = useState(5);
  const [simExecutor, setSimExecutor] = useState("Ejecutor_032");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<PredictionResponse | null>(null);
  const [registered, setRegistered] = useState(false);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const originalDays = useMemo(
    () =>
      Math.max(
        0,
        (new Date(form.deadline).getTime() - new Date(form.createdOn).getTime()) / 86400000,
      ),
    [form.createdOn, form.deadline],
  );

  async function onAnalyze() {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }
    if (new Date(form.deadline) <= new Date(form.createdOn)) {
      toast.error("La fecha límite debe ser posterior a la fecha de creación.");
      return;
    }
    setLoading(true);
    setSimResult(null);
    setRegistered(false);
    try {
      const r = await predict(form);
      setResult(r);
      setSimDays(Math.max(1, Math.round(originalDays) + 3));
      const other = EXECUTORS.find((e) => e !== form.executingUser)!;
      setSimExecutor(other);
      toast.success(`Riesgo estimado: ${Math.round(r.riskProbability * 100)} %`);
    } catch {
      toast.error("No fue posible calcular el riesgo.");
    } finally {
      setLoading(false);
    }
  }

  async function onSimulate() {
    if (!result) return;
    setSimLoading(true);
    const created = new Date(form.createdOn);
    const scenario: TaskInput = {
      ...form,
      executingUser: simExecutor,
      deadline: toLocalInput(new Date(created.getTime() + simDays * 86400000)),
    };
    try {
      setSimResult(await simulate(scenario));
    } finally {
      setSimLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[420px_1fr]">
        {/* FORMULARIO */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Datos de la tarea</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Solo información disponible al crear la tarea.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Título">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Descripción">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha de creación">
                <Input
                  type="datetime-local"
                  value={form.createdOn}
                  onChange={(e) => set("createdOn", e.target.value)}
                />
              </Field>
              <Field label="Fecha límite">
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de tarea">
                <Picker
                  value={form.typeTask}
                  options={TASK_TYPES}
                  onChange={(v) => set("typeTask", v)}
                />
              </Field>
              <Field label="Proyecto">
                <Picker
                  value={form.project}
                  options={PROJECTS}
                  onChange={(v) => set("project", v)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ejecutor">
                <Picker
                  value={form.executingUser}
                  options={EXECUTORS}
                  onChange={(v) => set("executingUser", v)}
                />
              </Field>
              <Field label="Creador">
                <Picker
                  value={form.creatorUser}
                  options={CREATORS}
                  onChange={(v) => set("creatorUser", v)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Empresa">
                <Picker
                  value={form.executingCompany}
                  options={COMPANIES}
                  onChange={(v) => set("executingCompany", v)}
                />
              </Field>
              <Field label="Puntos posibles">
                <Input
                  type="number"
                  min={1}
                  value={form.possiblePoints}
                  onChange={(e) => set("possiblePoints", Number(e.target.value) || 1)}
                />
              </Field>
            </div>

            <Button className="w-full" size="lg" onClick={onAnalyze} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Analizando…" : "Analizar riesgo"}
            </Button>

            <div className="rounded-md bg-secondary/70 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">
                Variables excluidas por fuga de información
              </p>
              <p className="mt-1">{LEAKAGE_FEATURES.join(" · ")}</p>
            </div>
          </div>
        </section>

        {/* RESULTADO */}
        <section className="space-y-6">
          {loading && <LoadingState />}
          {!loading && !result && <EmptyState />}
          {!loading && result && (
            <>
              <div className="rounded-xl border border-border bg-card p-7">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Riesgo de incumplimiento
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tarea {result.taskId} · modelo {result.modelVersion}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                      <Metric
                        icon={CalendarClock}
                        label="Días disponibles"
                        value={result.daysAvailable.toFixed(1)}
                      />
                      <Metric
                        icon={Layers}
                        label="Carga del ejecutor"
                        value={`${result.executorOpenTasks} tareas`}
                      />
                      <Metric
                        icon={UserRound}
                        label="Incumpl. histórico"
                        value={`${(result.executorHistoricalLateRate * 100).toFixed(1)} %`}
                      />
                      <Metric icon={Layers} label="Tipo" value={form.typeTask} />
                      <Metric
                        icon={CalendarClock}
                        label="Fecha límite"
                        value={new Date(form.deadline).toLocaleDateString("es-CO")}
                      />
                      <Metric
                        icon={Layers}
                        label="Puntos"
                        value={String(form.possiblePoints)}
                      />
                    </div>
                  </div>
                  <div className="mx-auto">
                    <RiskGauge probability={result.riskProbability} level={result.riskLevel} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-7">
                <h3 className="text-base font-semibold">¿Por qué se generó esta alerta?</h3>
                <ul className="mt-4 space-y-3">
                  {result.mainFactors.map((f) => (
                    <li key={f.feature} className="flex items-start gap-3">
                      {f.effect === "increases_risk" ? (
                        <ArrowUp className="mt-0.5 size-4 shrink-0 text-risk-high" />
                      ) : (
                        <ArrowDown className="mt-0.5 size-4 shrink-0 text-risk-low" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="text-xs text-muted-foreground">{f.value}</p>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(8, f.weight * 100)}%`,
                              backgroundColor:
                                f.effect === "increases_risk"
                                  ? "var(--risk-high)"
                                  : "var(--risk-low)",
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-7">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <Sparkles className="size-4 text-accent" /> Explicación con IA
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {result.explanation}
                  </p>
                  <p className="mt-4 text-[11px] text-muted-foreground/80">
                    {result.explanationSource === "llm"
                      ? "Generada por el modelo de lenguaje con datos anonimizados."
                      : "Generada con reglas locales sobre los factores del modelo (sin LLM configurado)."}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-7">
                  <h3 className="text-base font-semibold">Acción recomendada</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {result.recommendedAction}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant={registered ? "secondary" : "default"}
                      disabled={registered}
                      onClick={() => {
                        setRegistered(true);
                        toast.success("Alerta registrada para seguimiento del líder.");
                      }}
                    >
                      {registered ? <CheckCircle2 className="size-4" /> : null}
                      {registered ? "Alerta registrada" : "Registrar alerta"}
                    </Button>
                    <Button variant="outline" onClick={onSimulate} disabled={simLoading}>
                      <RefreshCcw className="size-4" /> Simular otro escenario
                    </Button>
                  </div>
                </div>
              </div>

              {/* WHAT-IF */}
              <div className="rounded-xl border border-border bg-card p-7">
                <h3 className="text-base font-semibold">Simulación what-if</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cambia las condiciones y compara el riesgo estimado.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Field label={`Plazo (original: ${originalDays.toFixed(1)} días)`}>
                    <Input
                      type="number"
                      min={1}
                      value={simDays}
                      onChange={(e) => setSimDays(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </Field>
                  <Field label={`Ejecutor (original: ${form.executingUser})`}>
                    <Picker value={simExecutor} options={EXECUTORS} onChange={setSimExecutor} />
                  </Field>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={onSimulate} disabled={simLoading}>
                      {simLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                      Simular
                    </Button>
                  </div>
                </div>

                {simResult && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <Comparison
                      label="Riesgo original"
                      value={result.riskProbability}
                      chip={result.riskLevel}
                    />
                    <Comparison
                      label="Riesgo simulado"
                      value={simResult.riskProbability}
                      chip={simResult.riskLevel}
                    />
                    <div className="rounded-lg border border-border p-5">
                      <p className="text-xs text-muted-foreground">Diferencia</p>
                      <p
                        className="mt-2 font-display text-2xl font-semibold tabular-nums"
                        style={{
                          color:
                            simResult.riskProbability <= result.riskProbability
                              ? "var(--risk-low)"
                              : "var(--risk-high)",
                        }}
                      >
                        {(
                          (simResult.riskProbability - result.riskProbability) *
                          100
                        ).toFixed(0)}{" "}
                        pp
                      </p>
                    </div>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-3">
                      <TrendingDown className="size-4 text-accent" />
                      {simResult.riskProbability < result.riskProbability
                        ? "Ajustar el plazo y/o redistribuir la tarea reduciría el riesgo estimado."
                        : "Este escenario no reduce el riesgo: conviene explorar otra combinación."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Comparison({
  label,
  value,
  chip,
}: {
  label: string;
  value: number;
  chip: PredictionResponse["riskLevel"];
}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-display text-2xl font-semibold tabular-nums">
          {Math.round(value * 100)} %
        </span>
        <RiskChip level={chip} />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-7">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Calculando variables y ejecutando el modelo…
      </p>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Sparkles className="size-6 text-accent" />
      <p className="mt-4 text-sm font-medium">Sin análisis todavía</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Completa los datos de la tarea y pulsa «Analizar riesgo» para obtener la probabilidad de
        incumplimiento, sus factores y la simulación what-if.
      </p>
    </div>
  );
}

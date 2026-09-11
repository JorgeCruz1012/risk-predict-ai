import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  ClipboardList,
  Gauge,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/agility/RiskGauge";
import { PROBLEM_STATS } from "@/lib/agility/demoData";
import { isDemoMode } from "@/lib/agility/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agility Risk AI — Alerta temprana de incumplimiento de tareas" },
      {
        name: "description",
        content:
          "Estima la probabilidad de incumplimiento de cada tarea desde su creación, explica los factores de riesgo y recomienda acciones al líder.",
      },
      { property: "og:title", content: "Agility Risk AI — Alerta temprana de incumplimiento" },
      {
        property: "og:description",
        content:
          "Predecir, explicar y actuar: riesgo de incumplimiento estimado al momento de crear la tarea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FLOW = [
  { icon: ClipboardList, label: "Nueva tarea" },
  { icon: Activity, label: "Análisis de características" },
  { icon: BrainCircuit, label: "Modelo de Machine Learning" },
  { icon: Gauge, label: "Probabilidad de incumplimiento" },
  { icon: Sparkles, label: "Explicación mediante IA" },
  { icon: ShieldCheck, label: "Acción del líder" },
];

const VALUE = [
  {
    icon: AlertTriangle,
    title: "Anticipación",
    text: "Detecta tareas con alto riesgo antes de su vencimiento.",
  },
  {
    icon: Lightbulb,
    title: "Explicabilidad",
    text: "Indica por qué el modelo generó la alerta, con datos reales.",
  },
  {
    icon: ShieldCheck,
    title: "Acción",
    text: "Entrega recomendaciones al líder para gestionar el riesgo.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Isotype />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">Agility Risk AI</p>
              <p className="text-[11px] text-muted-foreground">Uso académico / demostrativo</p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/app">
              Abrir centro de riesgo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-surface text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            {isDemoMode && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium tracking-wider text-white/80">
                <span className="size-1.5 rounded-full bg-accent" /> DATOS DEMO
              </span>
            )}
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] lg:text-6xl">
              Anticipa los incumplimientos antes de que ocurran
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
              Agility Risk AI analiza cada tarea desde el momento de su creación y estima su riesgo
              de incumplimiento para que los líderes puedan actuar antes del vencimiento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/app">Probar una predicción</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#como-funciona">Cómo funciona</a>
              </Button>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-white/45">
              Predecir → Explicar → Actuar
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/[0.06] p-8 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-widest text-white/60">
              Riesgo de incumplimiento
            </p>
            <div className="mt-6 flex flex-col items-center">
              <div className="[&_.text-foreground]:text-white [&_.stroke-muted]:stroke-white/15">
                <RiskGauge probability={0.78} level="HIGH" />
              </div>
              <p className="mt-5 text-sm text-white/70">Requiere intervención</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold lg:text-3xl">El incumplimiento se detecta tarde</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Hoy el incumplimiento se detecta después de ocurrido. Agility Risk AI busca anticiparlo.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: PROBLEM_STATS.totalTasks.toLocaleString("es-CO"), l: "Tareas analizadas" },
            { v: PROBLEM_STATS.lateTasks.toLocaleString("es-CO"), l: "Incumplimientos" },
            { v: "2,89 %", l: "Tareas fuera de plazo" },
            { v: PROBLEM_STATS.executors.toString(), l: "Ejecutores" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border bg-card p-6">
              <p className="font-display text-3xl font-semibold tabular-nums">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold lg:text-3xl">Cómo funciona</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {FLOW.map((step, i) => (
              <div key={step.label} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <step.icon className="size-5 text-accent" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium leading-snug">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROPUESTA DE VALOR */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUE.map((v) => (
            <div key={v.title} className="rounded-lg border border-border bg-card p-7">
              <v.icon className="size-6 text-accent" />
              <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 rounded-xl border border-border bg-surface px-8 py-10 text-primary-foreground">
          <p className="max-w-3xl text-lg leading-relaxed">
            «No buscamos explicar por qué una tarea incumplió. Buscamos detectar cuáles tienen
            mayor probabilidad de incumplir antes de que ocurra.»
          </p>
          <Button asChild className="mt-7" variant="secondary">
            <Link to="/app">
              Probar una predicción <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground">
          <p>Agility Risk AI · Proyecto académico con información anonimizada.</p>
          <p className="flex items-center gap-1.5">
            <Users className="size-3.5" /> Datos de usuarios anonimizados (Ejecutor_001…)
          </p>
        </div>
      </footer>
    </main>
  );
}

/** Isotipo abstracto: señal de alerta sobre una serie de datos. */
function Isotype() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M7 21l5-6 4 4 4-7 5 5"
        fill="none"
        stroke="oklch(0.62 0.09 208)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="17" r="2.6" fill="oklch(0.66 0.14 74)" />
    </svg>
  );
}

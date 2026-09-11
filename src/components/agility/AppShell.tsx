import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Database,
  LayoutDashboard,
  ListChecks,
  Settings,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";
import { isDemoMode } from "@/lib/agility/api";

/**
 * Marco del "Centro de Riesgo Operacional".
 * Los módulos aún no implementados se muestran deshabilitados (sin botones falsos).
 */
const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, ready: false },
  { label: "Nueva predicción", icon: Target, ready: true },
  { label: "Tareas", icon: ListChecks, ready: false },
  { label: "Alertas", icon: Bell, ready: false },
  { label: "Modelo", icon: BarChart3, ready: false },
  { label: "Carga de datos", icon: Database, ready: false },
  { label: "Configuración", icon: Settings, ready: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 text-primary-foreground lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-accent">
            <Target className="size-4" />
          </span>
          <span className="text-sm font-semibold">Agility Risk AI</span>
        </Link>
        <p className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Centro de Riesgo Operacional
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                item.ready ? "bg-white/10 font-medium text-white" : "text-white/45"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="size-4" />
                {item.label}
              </span>
              {!item.ready && (
                <span className="text-[9px] uppercase tracking-wider">Próximo</span>
              )}
            </div>
          ))}
        </nav>
        <p className="mt-auto px-2 text-[10px] leading-relaxed text-white/35">
          Uso académico / demostrativo. Datos de usuarios anonimizados.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Nueva predicción</h1>
            <p className="text-xs text-muted-foreground">
              Predecir → Explicar → Actuar, desde el momento de creación de la tarea.
            </p>
          </div>
          {isDemoMode && (
            <span className="rounded-full bg-risk-medium-soft px-3 py-1 text-[11px] font-semibold tracking-wider text-risk-medium">
              DATOS DEMO
            </span>
          )}
        </header>
        <div className="flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}

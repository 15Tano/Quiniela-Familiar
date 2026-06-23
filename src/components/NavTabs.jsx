import {
  Trophy,
  ListChecks,
  Users,
  ClipboardList,
  Goal,
  Lock,
  Eye,
  LogOut,
} from "lucide-react";

const ALL_TABS = [
  { id: "tabla", label: "Tabla", icon: Trophy },
  { id: "partidos", label: "Partidos", icon: ListChecks },
  { id: "participantes", label: "Participantes", icon: Users },
  { id: "predicciones", label: "Predicciones", icon: ClipboardList },
  { id: "resultados", label: "Resultados", icon: Goal },
  { id: "vista", label: "Vista", icon: Eye },
];

// Los familiares ("visitantes") solo necesitan ver la tabla y capturar
// sus predicciones. El resto de pestañas son cosas de administración.
const VISITOR_TAB_IDS = new Set(["tabla", "predicciones, vista"]);

export default function NavTabs({
  active,
  onChange,
  isAdmin,
  onRequestAdmin,
  onExitAdmin,
}) {
  const tabs = isAdmin
    ? ALL_TABS
    : ALL_TABS.filter((t) => VISITOR_TAB_IDS.has(t.id));

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.1rem)" }}
    >
      <nav
        className="glass-sm pointer-events-auto rounded-full p-1.5 flex items-center gap-1 max-w-[calc(100vw-2rem)] overflow-x-auto"
        aria-label="Secciones de la quiniela"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={`relative flex items-center shrink-0 rounded-full font-heading font-semibold text-sm whitespace-nowrap
                transition-[background-color,color,box-shadow,padding] duration-300 ease-out
                ${
                  isActive
                    ? "bg-pitch text-night px-4 py-2.5 shadow-[0_4px_18px_rgba(31,174,110,0.5)]"
                    : "text-mist hover:text-ink hover:bg-white/8 px-3 py-2.5"
                }`}
            >
              <Icon size={18} strokeWidth={2.4} className="shrink-0" />
              <span
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isActive
                    ? "max-w-[140px] opacity-100 ml-1.5"
                    : "max-w-0 opacity-0 ml-0"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}

        <span
          className="w-px h-6 bg-white/15 mx-0.5 shrink-0"
          aria-hidden="true"
        />

        {isAdmin ? (
          <button
            onClick={onExitAdmin}
            aria-label="Salir del modo administrador"
            title="Salir del modo administrador"
            className="flex items-center shrink-0 rounded-full px-3 py-2.5 text-coral hover:bg-coral/15 transition-colors"
          >
            <LogOut size={18} strokeWidth={2.4} />
          </button>
        ) : (
          <button
            onClick={onRequestAdmin}
            aria-label="Entrar como administrador"
            title="Entrar como administrador"
            className="flex items-center shrink-0 rounded-full px-3 py-2.5 text-mist hover:text-ink hover:bg-white/8 transition-colors"
          >
            <Lock size={18} strokeWidth={2.4} />
          </button>
        )}
      </nav>
    </div>
  );
}

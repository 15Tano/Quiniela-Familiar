import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";
import TeamTag from "./TeamTag";
import { scorePrediction } from "../utils/scoring";

function formatDatetime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PredictionBadge({ pred, match }) {
  const hasResult =
    match.resultA !== null &&
    match.resultA !== undefined &&
    match.resultB !== null &&
    match.resultB !== undefined;

  const hasPred =
    pred &&
    pred.scoreA !== null &&
    pred.scoreA !== undefined &&
    pred.scoreB !== null &&
    pred.scoreB !== undefined;

  if (!hasPred) {
    return (
      <span className="text-[var(--color-mist)] text-xs italic">
        Sin predicción
      </span>
    );
  }

  const scoreLabel = `${pred.scoreA} – ${pred.scoreB}`;

  if (!hasResult) {
    return (
      <span className="font-display text-sm text-[var(--color-ink)] tracking-wider">
        {scoreLabel}
      </span>
    );
  }

  const { points } = scorePrediction(pred, match);
  const styles = {
    2: {
      icon: "★",
      label: scoreLabel,
      color: "text-[var(--color-gold)]",
      bg: "bg-[var(--color-gold)]/10",
      border: "border border-[var(--color-gold)]/30",
      title: "Exacto",
    },
    1: {
      icon: "▲",
      label: scoreLabel,
      color: "text-[var(--color-pitch)]",
      bg: "bg-[var(--color-pitch)]/10",
      border: "border border-[var(--color-pitch)]/30",
      title: "Ganador correcto",
    },
    0: {
      icon: "○",
      label: scoreLabel,
      color: "text-[var(--color-mist)]",
      bg: "bg-white/5",
      border: "border border-white/10",
      title: "Fallo",
    },
  };

  const s = styles[points];

  return (
    <span
      title={s.title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${s.bg} ${s.border}`}
    >
      <span className={`text-xs ${s.color}`}>{s.icon}</span>
      <span className={`font-display text-sm tracking-wider ${s.color}`}>
        {s.label}
      </span>
    </span>
  );
}

export default function MatchViewTab({ matches, participants, predictions }) {
  // null = el usuario no ha navegado manualmente todavía
  const [manualIndex, setManualIndex] = useState(null);

  const sortedMatches = useMemo(() => {
    return [...matches].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime),
    );
  }, [matches]);

  // Índice del último partido con resultado (se recalcula cuando llegan datos)
  const defaultIndex = useMemo(() => {
    return sortedMatches.reduce((acc, m, idx) => {
      const played =
        m.resultA !== null &&
        m.resultA !== undefined &&
        m.resultB !== null &&
        m.resultB !== undefined;
      return played ? idx : acc;
    }, 0);
  }, [sortedMatches]);

  // Si el usuario no navegó, seguimos el defaultIndex; si navegó, usamos su elección
  const activeIndex = Math.min(
    manualIndex !== null ? manualIndex : defaultIndex,
    Math.max(0, sortedMatches.length - 1),
  );

  if (!sortedMatches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--color-mist)]">
        <p className="text-lg">No hay partidos cargados aún.</p>
      </div>
    );
  }

  const match = sortedMatches[activeIndex];

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--color-mist)]">
        <p className="text-lg">Cargando partidos...</p>
      </div>
    );
  }

  const hasResult =
    match.resultA !== null &&
    match.resultA !== undefined &&
    match.resultB !== null &&
    match.resultB !== undefined;

  const goPrev = () => setManualIndex(Math.max(0, activeIndex - 1));
  const goNext = () =>
    setManualIndex(Math.min(sortedMatches.length - 1, activeIndex + 1));

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* ── Cabecera del partido ── */}
      <div className="glass-strong rounded-2xl p-5 space-y-4">
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="p-2 rounded-xl glass hover:bg-white/10 transition disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Partido anterior"
          >
            <ChevronLeft size={20} className="text-[var(--color-ink)]" />
          </button>

          <span className="text-[var(--color-mist)] text-sm font-heading tracking-widest uppercase">
            Partido {activeIndex + 1} / {sortedMatches.length}
          </span>

          <button
            onClick={goNext}
            disabled={activeIndex === sortedMatches.length - 1}
            className="p-2 rounded-xl glass hover:bg-white/10 transition disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Partido siguiente"
          >
            <ChevronRight size={20} className="text-[var(--color-ink)]" />
          </button>
        </div>

        {/* Equipos */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamTag name={match.teamA} size="lg" />
            {hasResult && (
              <span className="font-display text-4xl text-[var(--color-ink)]">
                {match.resultA}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            {hasResult ? (
              <CheckCircle size={18} className="text-[var(--color-pitch)]" />
            ) : (
              <Clock size={18} className="text-[var(--color-mist)]" />
            )}
            <span className="text-[var(--color-mist)] text-xs font-heading">
              {hasResult ? "Final" : "VS"}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamTag name={match.teamB} size="lg" />
            {hasResult && (
              <span className="font-display text-4xl text-[var(--color-ink)]">
                {match.resultB}
              </span>
            )}
          </div>
        </div>

        {/* Fecha */}
        {match.datetime && (
          <p className="text-center text-[var(--color-mist)] text-xs font-body">
            {formatDatetime(match.datetime)}
            {match.group ? ` · Grupo ${match.group}` : ""}
          </p>
        )}

        {/* Leyenda */}
        {hasResult && (
          <div className="flex justify-center gap-4 pt-1 text-xs text-[var(--color-mist)] font-body">
            <span>
              <span className="text-[var(--color-gold)]">★</span> Exacto (2 pts)
            </span>
            <span>
              <span className="text-[var(--color-pitch)]">▲</span> Ganador (1
              pt)
            </span>
            <span>
              <span className="text-[var(--color-mist)]">○</span> Fallo (0 pts)
            </span>
          </div>
        )}
      </div>

      {/* ── Lista de participantes ── */}
      <div className="space-y-2">
        {participants.length === 0 && (
          <p className="text-center text-[var(--color-mist)] text-sm py-8">
            No hay participantes registrados.
          </p>
        )}

        {participants.map((p) => {
          const pred = predictions?.[p.id]?.[match.id];
          return (
            <div
              key={p.id}
              className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <span className="font-heading text-[var(--color-ink)] text-sm truncate">
                {p.name}
              </span>
              <PredictionBadge pred={pred} match={match} />
            </div>
          );
        })}
      </div>

      {/* ── Selector rápido ── */}
      <div className="flex flex-wrap justify-center gap-1.5 pt-2">
        {sortedMatches.map((m, idx) => {
          const played =
            m.resultA !== null &&
            m.resultA !== undefined &&
            m.resultB !== null &&
            m.resultB !== undefined;
          const isActive = idx === activeIndex;
          return (
            <button
              key={m.id}
              onClick={() => setManualIndex(idx)}
              title={`${m.teamA} vs ${m.teamB}`}
              className={`w-6 h-6 rounded-full text-[10px] font-display transition
                ${
                  isActive
                    ? "bg-[var(--color-pitch)] text-[var(--color-night)] scale-110"
                    : played
                      ? "bg-white/20 text-[var(--color-ink)]"
                      : "bg-white/8 text-[var(--color-mist)]"
                }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

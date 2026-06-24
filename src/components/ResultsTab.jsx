import { useMemo, useState } from "react";
import {
  Goal,
  CircleCheck,
  CircleDashed,
  Trophy,
  RefreshCw,
  Users,
  X,
  Plus,
  Minus,
  AlertTriangle,
} from "lucide-react";
import TeamTag from "./TeamTag";

function ResultInput({ value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Math.max(0, Math.min(99, Number(v))));
      }}
      placeholder="-"
      className="w-16 text-center bg-white/10 border border-white/20 rounded-lg py-2 font-display font-bold text-xl text-ink focus:bg-white/20 outline-none [color-scheme:dark]"
    />
  );
}

// ── Modal: publicar ganador ──────────────────────────────────────────────────

function PublishWinnerModal({
  participants,
  currentRound,
  onConfirm,
  onClose,
}) {
  const [selected, setSelected] = useState([]);
  const [points, setPoints] = useState("");

  function toggleParticipant(p) {
    setSelected((prev) =>
      prev.find((s) => s.participantId === p.id)
        ? prev.filter((s) => s.participantId !== p.id)
        : [...prev, { participantId: p.id, name: p.name }],
    );
  }

  function handleConfirm() {
    if (!selected.length || !points) return;
    const winners = selected.map((s) => ({ ...s, points: Number(points) }));
    onConfirm(winners);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl p-6 w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              Publicar ganador
            </h3>
            <p className="text-xs text-mist mt-0.5">Ronda {currentRound}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition text-mist"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seleccionar participantes */}
        <div className="space-y-2">
          <p className="text-xs text-mist font-heading uppercase tracking-wider">
            Ganador(es) — toca para seleccionar
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {participants.map((p) => {
              const isSelected = selected.find((s) => s.participantId === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleParticipant(p)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition
                    ${
                      isSelected
                        ? "bg-gold/20 border border-gold/40 text-ink"
                        : "glass hover:bg-white/10 text-mist"
                    }`}
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pitch to-pitch-light/40 flex items-center justify-center font-heading font-bold text-night text-sm shrink-0">
                    {p.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="font-heading font-semibold text-sm flex-1">
                    {p.name}
                  </span>
                  {isSelected && (
                    <Trophy size={14} className="text-gold shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Puntos */}
        <div className="space-y-1.5">
          <p className="text-xs text-mist font-heading uppercase tracking-wider">
            Puntos del ganador
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setPoints((p) => String(Math.max(0, Number(p) - 1)))
              }
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-mist hover:bg-white/10 transition"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="0"
              className="flex-1 text-center bg-white/10 border border-white/20 rounded-xl py-2 font-display font-bold text-2xl text-gold focus:bg-white/20 outline-none [color-scheme:dark]"
            />
            <button
              onClick={() => setPoints((p) => String(Number(p) + 1))}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-mist hover:bg-white/10 transition"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl glass text-mist font-heading font-semibold text-sm hover:bg-white/10 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected.length || !points}
            className="flex-1 py-2.5 rounded-xl bg-gold text-night font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: confirmar nueva ronda ─────────────────────────────────────────────

function NewRoundModal({ currentRound, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl p-6 w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-coral/15 flex items-center justify-center">
            <AlertTriangle size={28} className="text-coral" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">
              ¿Iniciar Ronda {currentRound + 1}?
            </h3>
            <p className="text-sm text-mist mt-1 leading-relaxed">
              Se borrarán{" "}
              <span className="text-ink font-semibold">
                todos los resultados
              </span>{" "}
              actuales y los puntos volverán a 0. Las predicciones y
              participantes se mantienen. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl glass text-mist font-heading font-semibold text-sm hover:bg-white/10 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-coral text-white font-heading font-bold text-sm hover:brightness-110 transition"
          >
            Sí, nueva ronda
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ResultsTab({
  matches,
  participants,
  currentRound,
  setMatches,
  publishRoundWinner,
  startNewRound,
}) {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showNewRoundModal, setShowNewRoundModal] = useState(false);

  const sorted = useMemo(
    () =>
      [...matches].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [matches],
  );

  const finishedCount = matches.filter(
    (m) => m.resultA !== null && m.resultA !== undefined,
  ).length;

  function updateResult(id, field, value) {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  }

  return (
    <>
      {showPublishModal && (
        <PublishWinnerModal
          participants={participants}
          currentRound={currentRound}
          onConfirm={publishRoundWinner}
          onClose={() => setShowPublishModal(false)}
        />
      )}
      {showNewRoundModal && (
        <NewRoundModal
          currentRound={currentRound}
          onConfirm={startNewRound}
          onClose={() => setShowNewRoundModal(false)}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
        <section className="glass-strong rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink flex items-center gap-2">
                <Goal size={20} className="text-pitch-light" /> Resultados
                oficiales
              </h2>
              <p className="text-sm text-mist">
                Ronda {currentRound} · {finishedCount}/{matches.length}{" "}
                finalizados
              </p>
            </div>
            <span className="font-heading text-sm text-mist">
              {finishedCount}/{matches.length}
            </span>
          </div>

          {/* Acciones de ronda */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/15 border border-gold/30 text-gold font-heading font-semibold text-sm hover:bg-gold/25 transition"
            >
              <Trophy size={15} />
              Publicar ganador
            </button>
            <button
              onClick={() => setShowNewRoundModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral/10 border border-coral/30 text-coral font-heading font-semibold text-sm hover:bg-coral/20 transition"
            >
              <RefreshCw size={15} />
              Nueva ronda
            </button>
          </div>
        </section>

        {/* Partidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((m) => {
            const finished = m.resultA !== null && m.resultA !== undefined;
            return (
              <div
                key={m.id}
                className="glass rounded-2xl p-4 flex items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <TeamTag name={m.teamA} size="sm" />
                </div>
                <ResultInput
                  value={m.resultA}
                  onChange={(v) => updateResult(m.id, "resultA", v)}
                />
                <span className="text-mist font-heading">-</span>
                <ResultInput
                  value={m.resultB}
                  onChange={(v) => updateResult(m.id, "resultB", v)}
                />
                <div className="flex-1 min-w-0">
                  <TeamTag name={m.teamB} align="right" size="sm" />
                </div>
                <span title={finished ? "Finalizado" : "Pendiente"}>
                  {finished ? (
                    <CircleCheck size={20} className="text-pitch-light" />
                  ) : (
                    <CircleDashed size={20} className="text-mist/50" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

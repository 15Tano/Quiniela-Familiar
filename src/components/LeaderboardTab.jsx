import { useMemo } from "react";
import {
  Trophy,
  Target,
  CircleDot,
  Wallet,
  Goal,
  Users,
  Crown,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CalendarDays,
} from "lucide-react";
import {
  buildLeaderboard,
  isMatchFinished,
  getLeaderStreak,
  getNextMatch,
} from "../utils/scoring";
import TeamTag from "./TeamTag";

const CUOTA = 100;

// ── Cuenta regresiva ─────────────────────────────────────────────────────────

function useCountdown(targetDate) {
  const [now, setNow] = useMemo(() => {
    // Usamos un truco: devolvemos estado mutable sin useState real
    // porque este hook vive dentro de useMemo; lo haremos con un ref pattern
    return [Date.now(), null];
  }, []);

  // Implementación real con useState
  const [tick, setTick] = useMemo(() => {
    let interval;
    const start = () => {
      interval = setInterval(() => {}, 1000);
      return () => clearInterval(interval);
    };
    return [0, start];
  }, []);

  return null; // placeholder — ver implementación abajo
}

// ── Partido del día ──────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

function NextMatchCard({ match }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!match?.datetime) return;

    function update() {
      const diff = new Date(match.datetime) - Date.now();
      if (diff <= 0) {
        setTimeLeft("¡En curso!");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${mins}m ${secs}s`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [match]);

  if (!match) return null;

  const fecha = new Date(match.datetime).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      className="glass-strong rounded-2xl p-4 sm:p-5 space-y-3 border border-pitch/20"
      style={{ animation: "fadeSlideUp 0.5s ease both" }}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-pitch/20 flex items-center justify-center shrink-0">
          <CalendarDays size={15} className="text-pitch-light" />
        </span>
        <span className="font-heading text-xs uppercase tracking-widest text-pitch-light font-semibold">
          Próximo partido
        </span>
        {/* Dot parpadeante */}
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pitch-light opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pitch" />
          </span>
          <span className="text-[10px] text-mist font-body">
            En vivo pronto
          </span>
        </span>
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex justify-center">
          <TeamTag name={match.teamA} size="md" />
        </div>
        <div className="flex flex-col items-center shrink-0 px-2">
          <span className="font-display text-xs text-mist tracking-widest">
            VS
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <TeamTag name={match.teamB} size="md" align="right" />
        </div>
      </div>

      {/* Cuenta regresiva */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <span className="flex items-center gap-1.5 text-[11px] text-mist font-body capitalize">
          <Clock size={12} />
          {fecha}
        </span>
        <span className="font-display text-sm text-gold tracking-wider">
          {timeLeft}
        </span>
      </div>
    </section>
  );
}

// ── Configuración visual del podio ───────────────────────────────────────────

const PODIUM_CONFIG = {
  1: {
    order: "order-2",
    pedestal: "h-28 sm:h-36",
    avatar: "w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl",
    ring: "ring-[3px] ring-gold/70",
    avatarGlow: "shadow-[0_0_36px_rgba(244,183,64,0.45)]",
    medalBg: "bg-gradient-to-br from-gold to-gold-light",
    pedestalBg: "from-gold/25 via-gold/10 to-transparent",
    nameSize: "text-sm sm:text-base",
    ptsSize: "text-3xl sm:text-4xl",
    ptsColor: "text-gold-light",
    animDelay: "0.35s",
    pedestalDelay: "0.55s",
  },
  2: {
    order: "order-1",
    pedestal: "h-20 sm:h-24",
    avatar: "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg",
    ring: "ring-2 ring-white/35",
    avatarGlow: "",
    medalBg: "bg-gradient-to-br from-slate-200 to-slate-400",
    pedestalBg: "from-white/12 via-white/5 to-transparent",
    nameSize: "text-xs sm:text-sm",
    ptsSize: "text-2xl sm:text-3xl",
    ptsColor: "text-ink",
    animDelay: "0.15s",
    pedestalDelay: "0.25s",
  },
  3: {
    order: "order-3",
    pedestal: "h-16 sm:h-20",
    avatar: "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg",
    ring: "ring-2 ring-amber-600/50",
    avatarGlow: "",
    medalBg: "bg-gradient-to-br from-amber-600 to-amber-400",
    pedestalBg: "from-amber-700/20 via-amber-700/8 to-transparent",
    nameSize: "text-xs sm:text-sm",
    ptsSize: "text-2xl sm:text-3xl",
    ptsColor: "text-ink",
    animDelay: "0.25s",
    pedestalDelay: "0.35s",
  },
};

// ── Componente de tendencia ──────────────────────────────────────────────────

function TrendIcon({ trend }) {
  if (trend === "up")
    return <TrendingUp size={13} className="text-pitch-light shrink-0" />;
  if (trend === "down")
    return <TrendingDown size={13} className="text-coral shrink-0" />;
  return <Minus size={13} className="text-mist/40 shrink-0" />;
}

// ── Badges de racha y last-correct ──────────────────────────────────────────

function ExactStreakBadge({ streak }) {
  if (streak < 2) return null;
  return (
    <span
      title={`${streak} exactos seguidos`}
      className="inline-flex items-center gap-0.5 text-[11px] font-heading font-semibold text-orange-300"
    >
      <Flame size={12} className="text-orange-400" />
      {streak}
    </span>
  );
}

function LastCorrectBadge({ correct }) {
  if (!correct) return null;
  return (
    <span title="Acertó el último partido">
      <Zap size={12} className="text-gold-light" />
    </span>
  );
}

// ── Podium spot ──────────────────────────────────────────────────────────────

function PodiumSpot({ participant, rank, leaderPts, leaderStreak, isLeader }) {
  const cfg = PODIUM_CONFIG[rank];
  const initial = participant.name.trim().charAt(0).toUpperCase();
  const gap = leaderPts - participant.points;

  // Corona: dorada sólida si lleva racha como líder, normal si no
  const crownClass =
    isLeader && leaderStreak >= 3
      ? "text-gold drop-shadow-[0_2px_10px_rgba(244,183,64,0.9)] animate-bounce"
      : "text-gold-light drop-shadow-[0_2px_8px_rgba(244,183,64,0.65)]";

  return (
    <div
      className={`flex flex-col items-center ${cfg.order} w-24 sm:w-32`}
      style={{
        animation: `podiumEntry 0.6s cubic-bezier(.34,1.56,.64,1) ${cfg.animDelay} both`,
      }}
    >
      {/* Avatar + corona */}
      <div className="relative mb-2">
        {rank === 1 && (
          <Crown
            size={24}
            fill="currentColor"
            className={`absolute -top-6 left-1/2 -translate-x-1/2 ${crownClass}`}
          />
        )}
        {/* Glow animado para el 1er lugar */}
        {rank === 1 && (
          <span
            className="absolute inset-0 rounded-full bg-gold/20 animate-ping"
            style={{ animationDuration: "2.5s" }}
          />
        )}
        <span
          className={`relative ${cfg.avatar} ${cfg.ring} ${cfg.avatarGlow} rounded-full bg-gradient-to-br from-pitch to-pitch-light/50 flex items-center justify-center font-heading font-bold text-night`}
        >
          {initial}
        </span>

        {/* Badges encima del avatar */}
        <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5">
          <ExactStreakBadge streak={participant.exactStreak} />
          <LastCorrectBadge correct={participant.lastCorrect} />
        </div>
      </div>

      {/* Nombre */}
      <p
        className={`font-heading font-semibold text-ink ${cfg.nameSize} text-center truncate w-full px-1`}
      >
        {participant.name}
      </p>

      {/* Tendencia */}
      <div className="flex items-center gap-1 mt-0.5 mb-1">
        <TrendIcon trend={participant.trend} />
      </div>

      {/* Puntos */}
      <p
        className={`font-heading font-extrabold ${cfg.ptsSize} ${cfg.ptsColor} leading-none`}
      >
        {participant.points}
      </p>
      <p className="text-[10px] text-mist uppercase tracking-wide">pts</p>

      {/* Mini stats */}
      <div className="flex items-center gap-2 mt-1 mb-2 text-[10px] text-mist">
        <span className="flex items-center gap-0.5">
          <Target size={9} className="text-pitch-light" />
          {participant.exact}
        </span>
        <span className="flex items-center gap-0.5">
          <Goal size={9} className="text-gold-light" />
          {participant.winnerOnly}
        </span>
      </div>

      {/* Diferencia con el líder (solo 2do y 3ro) */}
      {rank > 1 && gap > 0 && (
        <p className="text-[10px] text-mist mb-1.5">−{gap} pts</p>
      )}

      {/* Racha de liderazgo (solo 1ro) */}
      {rank === 1 && leaderStreak >= 2 && (
        <p className="text-[10px] text-gold/70 mb-1.5 font-heading text-center px-1">
          Líder{" "}
          {leaderStreak === 2
            ? "desde hace 2 partidos"
            : `${leaderStreak} partidos seguidos`}
        </p>
      )}

      {/* Pedestal */}
      <div
        className={`glass-glossy w-full ${cfg.pedestal} rounded-t-2xl flex items-start justify-center pt-2.5 bg-gradient-to-b ${cfg.pedestalBg}`}
        style={{
          animation: `pedestalRise 0.5s ease ${cfg.pedestalDelay} both`,
        }}
      >
        <span
          className={`w-8 h-8 rounded-full ${cfg.medalBg} text-night font-heading font-extrabold flex items-center justify-center text-sm shadow-md`}
        >
          {rank}
        </span>
      </div>
    </div>
  );
}

// ── Fila de resumen ──────────────────────────────────────────────────────────

function SummaryRow({ icon: Icon, label, value, sublabel, accent = "pitch" }) {
  const accentClass =
    accent === "gold"
      ? "bg-gradient-to-br from-gold/35 to-gold/5 text-gold-light"
      : "bg-gradient-to-br from-pitch/35 to-pitch/5 text-pitch-light";
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${accentClass}`}
      >
        <Icon size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-ink text-sm truncate">
          {label}
        </p>
        {sublabel && (
          <p className="text-[11px] text-mist truncate">{sublabel}</p>
        )}
      </div>
      <span className="font-heading text-lg sm:text-xl font-bold text-ink shrink-0 text-right">
        {value}
      </span>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function LeaderboardTab({ participants, matches, predictions }) {
  const leaderboard = useMemo(
    () => buildLeaderboard(participants, matches, predictions),
    [participants, matches, predictions],
  );

  const { leaderId, streak: leaderStreak } = useMemo(
    () => getLeaderStreak(participants, matches, predictions),
    [participants, matches, predictions],
  );

  const nextMatch = useMemo(() => getNextMatch(matches), [matches]);

  const playedCount = matches.filter(isMatchFinished).length;
  const total = participants.length * CUOTA;
  const leaderPts = leaderboard[0]?.points ?? 0;

  const podiumEntries = [2, 1, 3]
    .map((rank) => ({ rank, participant: leaderboard[rank - 1] }))
    .filter((entry) => entry.participant);

  const rest = leaderboard.slice(3);

  return (
    <>
      {/* Animaciones CSS */}
      <style>{`
        @keyframes podiumEntry {
          from { opacity: 0; transform: translateY(40px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes pedestalRise {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .badge-pop { animation: badgePop 0.4s cubic-bezier(.34,1.56,.64,1) 0.8s both; }
      `}</style>

      <div className="space-y-6">
        {/* ── Partido del día ── */}
        {nextMatch && <NextMatchCard match={nextMatch} />}

        {/* ── Tabla de posiciones ── */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-ink px-1">
            Tabla de posiciones
          </h2>

          {leaderboard.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-mist">
              Agrega participantes y partidos para ver la tabla aquí.
            </div>
          )}

          {/* Podio */}
          {podiumEntries.length > 0 && (
            <div className="flex items-end justify-center gap-2 sm:gap-5 px-1 pt-2">
              {podiumEntries.map(({ rank, participant }) => (
                <PodiumSpot
                  key={participant.id}
                  rank={rank}
                  participant={participant}
                  leaderPts={leaderPts}
                  leaderStreak={leaderStreak}
                  isLeader={participant.id === leaderId}
                />
              ))}
            </div>
          )}

          {/* Leyenda de badges */}
          {leaderboard.some((p) => p.exactStreak >= 2 || p.lastCorrect) && (
            <div className="flex flex-wrap justify-center gap-3 text-[11px] text-mist px-2">
              <span className="flex items-center gap-1">
                <Flame size={11} className="text-orange-400" /> Racha de exactos
              </span>
              <span className="flex items-center gap-1">
                <Zap size={11} className="text-gold-light" /> Acertó el último
              </span>
            </div>
          )}

          {/* 4to lugar en adelante */}
          {rest.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {rest.map((p, i) => {
                const rank = i + 4;
                const gap = leaderPts - p.points;
                return (
                  <div
                    key={p.id}
                    className="glass rounded-2xl p-3.5 sm:p-4 flex items-center gap-3"
                    style={{
                      animation: `fadeSlideUp 0.4s ease ${0.1 + i * 0.06}s both`,
                    }}
                  >
                    <span className="w-6 shrink-0 text-center font-heading font-semibold text-mist text-sm">
                      {rank}
                    </span>
                    <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-pitch to-pitch-light/40 flex items-center justify-center font-heading font-bold text-night">
                      {p.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-heading font-semibold text-ink truncate">
                          {p.name}
                        </p>
                        <ExactStreakBadge streak={p.exactStreak} />
                        <LastCorrectBadge correct={p.lastCorrect} />
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-mist mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Target size={11} className="text-pitch-light" />{" "}
                          {p.exact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Goal size={11} className="text-gold-light" />{" "}
                          {p.winnerOnly}
                        </span>
                        <span className="flex items-center gap-1">
                          <CircleDot size={11} className="text-mist/50" />{" "}
                          {p.misses}
                        </span>
                        <TrendIcon trend={p.trend} />
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <div className="flex items-baseline gap-1 rounded-full px-3 py-1.5 bg-white/8">
                        <span className="font-heading font-bold text-lg text-ink">
                          {p.points}
                        </span>
                        <span className="text-[10px] text-mist uppercase">
                          pts
                        </span>
                      </div>
                      {gap > 0 && (
                        <span className="text-[10px] text-mist pr-1">
                          −{gap} pts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Resumen de banca ── */}
        <section className="glass-glossy rounded-3xl p-5 sm:p-6">
          <h2 className="font-heading text-lg font-bold text-ink mb-1">
            Resumen
          </h2>
          <div className="divide-y divide-white/10">
            <SummaryRow
              icon={Wallet}
              label="Banca total"
              value={`$${total.toLocaleString("es-MX")}`}
              sublabel={`${participants.length} × $${CUOTA} c/u`}
              accent="gold"
            />
            <SummaryRow
              icon={Users}
              label="Participantes"
              value={participants.length}
            />
            <SummaryRow
              icon={Goal}
              label="Partidos jugados"
              value={`${playedCount} de ${matches.length}`}
            />
          </div>
        </section>

        {participants.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-mist px-1">
            <Trophy size={13} className="text-gold-light" /> El ganador se lleva
            la banca acordada en familia. ¡Suerte!
          </p>
        )}
      </div>
    </>
  );
}

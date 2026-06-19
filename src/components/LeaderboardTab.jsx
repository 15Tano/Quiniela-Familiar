import { useMemo } from "react";
import {
  Trophy,
  Target,
  CircleDot,
  Wallet,
  Goal,
  Users,
  Crown,
} from "lucide-react";
import { buildLeaderboard, isMatchFinished } from "../utils/scoring";

const CUOTA = 100;

// Estilos por escalón del podio: el de en medio (1er lugar) siempre el más
// alto y vistoso; 2do a la izquierda, 3ro a la derecha, como un podio real.
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
  },
};

function PodiumSpot({ participant, rank }) {
  const cfg = PODIUM_CONFIG[rank];
  const initial = participant.name.trim().charAt(0).toUpperCase();

  return (
    <div className={`flex flex-col items-center ${cfg.order} w-24 sm:w-32`}>
      <div className="relative mb-2">
        {rank === 1 && (
          <Crown
            size={24}
            fill="currentColor"
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-gold-light drop-shadow-[0_2px_8px_rgba(244,183,64,0.65)]"
          />
        )}
        <span
          className={`${cfg.avatar} ${cfg.ring} ${cfg.avatarGlow} rounded-full bg-gradient-to-br from-pitch to-pitch-light/50 flex items-center justify-center font-heading font-bold text-night`}
        >
          {initial}
        </span>
      </div>
      <p
        className={`font-heading font-semibold text-ink ${cfg.nameSize} text-center truncate w-full px-1`}
      >
        {participant.name}
      </p>
      <p
        className={`font-heading font-extrabold ${cfg.ptsSize} ${cfg.ptsColor} leading-none mt-1`}
      >
        {participant.points}
      </p>
      <p className="text-[10px] text-mist uppercase tracking-wide mb-2">pts</p>

      <div
        className={`glass-glossy w-full ${cfg.pedestal} rounded-t-2xl flex items-start justify-center pt-2.5 bg-gradient-to-b ${cfg.pedestalBg}`}
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

// Fila simple de estadística para el resumen: ícono + etiqueta a la
// izquierda, valor a la derecha. Una sola fila por dato (no columnas) para
// que se acomode solo en pantallas angostas.
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

export default function LeaderboardTab({ participants, matches, predictions }) {
  const leaderboard = useMemo(
    () => buildLeaderboard(participants, matches, predictions),
    [participants, matches, predictions],
  );

  const playedCount = matches.filter(isMatchFinished).length;
  const total = participants.length * CUOTA;

  const podiumEntries = [2, 1, 3]
    .map((rank) => ({ rank, participant: leaderboard[rank - 1] }))
    .filter((entry) => entry.participant);

  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-ink px-1">
          Tabla de posiciones
        </h2>

        {leaderboard.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-mist">
            Agrega participantes y partidos para ver la tabla aquí.
          </div>
        )}

        {podiumEntries.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-5 px-1 pt-2">
            {podiumEntries.map(({ rank, participant }) => (
              <PodiumSpot
                key={participant.id}
                rank={rank}
                participant={participant}
              />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {rest.map((p, i) => {
              const rank = i + 4;
              return (
                <div
                  key={p.id}
                  className="glass rounded-2xl p-3.5 sm:p-4 flex items-center gap-3"
                >
                  <span className="w-6 shrink-0 text-center font-heading font-semibold text-mist text-sm">
                    {rank}
                  </span>
                  <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-pitch to-pitch-light/40 flex items-center justify-center font-heading font-bold text-night">
                    {p.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-ink truncate">
                      {p.name}
                    </p>
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
                    </div>
                  </div>
                  <div className="shrink-0 flex items-baseline gap-1 rounded-full px-3 py-1.5 bg-white/8">
                    <span className="font-heading font-bold text-lg text-ink">
                      {p.points}
                    </span>
                    <span className="text-[10px] text-mist uppercase">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
  );
}

// Banner público que muestra el/los ganadores de la ronda más reciente.
// Se coloca arriba de todo en LeaderboardTab.

import { Trophy, Star, Medal } from "lucide-react";

function WinnerCard({ winner, index, total }) {
  const initial = winner.name.trim().charAt(0).toUpperCase();
  const isOnlyWinner = total === 1;

  return (
    <div
      className={`flex flex-col items-center gap-2 ${isOnlyWinner ? "w-full max-w-xs" : "flex-1 min-w-0"}`}
      style={{
        animation: `winnerEntry 0.7s cubic-bezier(.34,1.56,.64,1) ${index * 0.12}s both`,
      }}
    >
      {/* Avatar con glow dorado */}
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full bg-gold/30 animate-ping"
          style={{ animationDuration: "2.8s" }}
        />
        <span
          className={`relative flex items-center justify-center rounded-full font-heading font-extrabold text-night bg-gradient-to-br from-gold to-gold-light shadow-[0_0_32px_rgba(244,183,64,0.6)]
          ${isOnlyWinner ? "w-20 h-20 text-3xl" : "w-14 h-14 text-xl"}`}
        >
          {initial}
        </span>
        <Star
          size={isOnlyWinner ? 18 : 14}
          fill="currentColor"
          className="absolute -top-1.5 -right-1.5 text-gold drop-shadow-[0_0_6px_rgba(244,183,64,0.9)]"
        />
      </div>

      {/* Nombre */}
      <p
        className={`font-heading font-bold text-ink text-center truncate w-full px-1
        ${isOnlyWinner ? "text-xl" : "text-sm"}`}
      >
        {winner.name}
      </p>

      {/* Puntos */}
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display font-extrabold text-gold leading-none
          ${isOnlyWinner ? "text-4xl" : "text-2xl"}`}
        >
          {winner.points}
        </span>
        <span className="text-[10px] text-gold/70 uppercase tracking-wide">
          pts
        </span>
      </div>
    </div>
  );
}

export default function RoundWinnerBanner({ rounds, currentRound }) {
  // Muestra el ganador de la ronda más reciente que tenga ganador publicado
  const latestWithWinner = [...(rounds ?? [])]
    .filter((r) => r.winners?.length > 0)
    .sort((a, b) => b.number - a.number)[0];

  if (!latestWithWinner) return null;

  const { number, winners } = latestWithWinner;
  const isTie = winners.length > 1;

  return (
    <>
      <style>{`
        @keyframes winnerEntry {
          from { opacity: 0; transform: translateY(30px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #f4b740 0%, #ffd676 40%, #f4b740 60%, #c8860a 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <section
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-gold/25"
        style={{
          background:
            "linear-gradient(135deg, rgba(244,183,64,0.12) 0%, rgba(14,24,48,0.6) 50%, rgba(244,183,64,0.08) 100%)",
          backdropFilter: "blur(20px)",
          animation: "fadeSlideUp 0.5s ease both",
        }}
      >
        {/* Destellos de fondo */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gold/8 rounded-full blur-2xl pointer-events-none" />

        {/* Encabezado */}
        <div className="relative flex flex-col items-center gap-1 mb-5">
          <div className="flex items-center gap-2">
            <Medal size={16} className="text-gold" />
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-gold/70 font-semibold">
              Ronda {number}
            </span>
            <Medal size={16} className="text-gold" />
          </div>
          <h2 className="gold-shimmer font-heading font-extrabold text-2xl sm:text-3xl text-center">
            {isTie ? "¡Empate en la cima!" : "¡Campeón de ronda!"}
          </h2>
          {isTie && (
            <p className="text-xs text-mist text-center">
              {winners.length} participantes comparten el trono
            </p>
          )}
        </div>

        {/* Ganadores */}
        <div
          className={`relative flex items-end justify-center gap-4 sm:gap-6
          ${isTie ? "flex-wrap" : ""}`}
        >
          {winners.map((w, i) => (
            <WinnerCard
              key={w.participantId}
              winner={w}
              index={i}
              total={winners.length}
            />
          ))}
        </div>

        {/* Separador decorativo */}
        <div className="relative mt-5 pt-4 border-t border-gold/15 flex items-center justify-center gap-2">
          <Trophy size={13} className="text-gold/50" />
          <p className="text-[11px] text-mist text-center">
            {currentRound > number
              ? `Actualmente en Ronda ${currentRound}`
              : "Ronda en curso"}
          </p>
          <Trophy size={13} className="text-gold/50" />
        </div>
      </section>
    </>
  );
}

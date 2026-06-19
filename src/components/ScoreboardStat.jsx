// Tarjeta de estadística suave (sin LED ni neón) para mostrar un número
// destacado dentro de una tarjeta de cristal. Usada en Participantes.
export default function ScoreboardStat({
  label,
  value,
  glow = "green",
  sublabel,
}) {
  const valueColor = glow === "gold" ? "text-gold-light" : "text-pitch-light";
  return (
    <div className="glass-soft rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[110px] flex-1">
      <span
        className={`font-heading text-2xl sm:text-3xl font-bold ${valueColor}`}
      >
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-mist mt-0.5 text-center">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-mist/60 mt-0.5 text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
}

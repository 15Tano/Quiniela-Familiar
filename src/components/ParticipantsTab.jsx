import { useState } from "react";
import { UserPlus, Trash2, Wallet } from "lucide-react";
import ScoreboardStat from "./ScoreboardStat";

const CUOTA = 100;

export default function ParticipantsTab({ participants, setParticipants }) {
  const [name, setName] = useState("");

  function addParticipant(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setParticipants((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, name: clean },
    ]);
    setName("");
  }

  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  const total = participants.length * CUOTA;

  return (
    <div className="space-y-6">
      <section className="glass-md rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink flex items-center gap-2">
              <Wallet size={20} className="text-gold-light" /> Banca de la
              quiniela
            </h2>
            <p className="text-sm text-mist">
              Cuota de ${CUOTA} MXN por participante.
            </p>
          </div>
          <div className="flex gap-3">
            <ScoreboardStat
              label="Participantes"
              value={participants.length}
              glow="green"
            />
            <ScoreboardStat
              label="Banca total"
              value={`$${total.toLocaleString("es-MX")}`}
              glow="gold"
              sublabel={`${participants.length} x $${CUOTA}`}
            />
          </div>
        </div>

        <form
          onSubmit={addParticipant}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del participante"
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-ink placeholder:text-mist/60 focus:bg-white/10 outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-pitch text-night font-heading font-bold rounded-xl px-5 py-2.5 hover:bg-pitch-light transition-colors"
          >
            <UserPlus size={18} /> Agregar
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-ink mb-3 px-1">
          Participantes ({participants.length}/16)
        </h2>

        {participants.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-mist">
            Todavía no hay participantes. Agrega a los 16 de la familia arriba.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl p-3.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-pitch to-pitch-light/40 flex items-center justify-center font-heading font-bold text-night">
                  {p.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="font-heading font-semibold text-ink truncate">
                  {p.name}
                </span>
              </div>
              <button
                onClick={() => removeParticipant(p.id)}
                className="p-1.5 rounded-lg hover:bg-coral/20 text-mist hover:text-coral shrink-0"
                aria-label={`Eliminar a ${p.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

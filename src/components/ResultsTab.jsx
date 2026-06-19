import { useMemo } from 'react'
import { Goal, CircleCheck, CircleDashed } from 'lucide-react'
import TeamTag from './TeamTag'

function ResultInput({ value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : Math.max(0, Math.min(99, Number(v))))
      }}
      placeholder="-"
      className="w-16 text-center bg-white/10 border border-white/20 rounded-lg py-2 font-display font-bold text-xl text-ink focus:bg-white/20 outline-none [color-scheme:dark]"
    />
  )
}

export default function ResultsTab({ matches, setMatches }) {
  const sorted = useMemo(
    () => [...matches].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [matches]
  )

  const finishedCount = matches.filter(
    (m) => m.resultA !== null && m.resultA !== undefined
  ).length

  function updateResult(id, field, value) {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  return (
    <div className="space-y-5">
      <section className="glass-strong rounded-3xl p-5 sm:p-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-ink flex items-center gap-2">
            <Goal size={20} className="text-pitch-light" /> Resultados oficiales
          </h2>
          <p className="text-sm text-mist">
            Captura el marcador final y la tabla se recalcula sola.
          </p>
        </div>
        <span className="font-heading text-sm text-mist">
          {finishedCount}/{matches.length} finalizados
        </span>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((m) => {
          const finished = m.resultA !== null && m.resultA !== undefined
          return (
            <div key={m.id} className="glass rounded-2xl p-4 flex items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <TeamTag name={m.teamA} size="sm" />
              </div>
              <ResultInput value={m.resultA} onChange={(v) => updateResult(m.id, 'resultA', v)} />
              <span className="text-mist font-heading">-</span>
              <ResultInput value={m.resultB} onChange={(v) => updateResult(m.id, 'resultB', v)} />
              <div className="flex-1 min-w-0">
                <TeamTag name={m.teamB} align="right" size="sm" />
              </div>
              <span title={finished ? 'Finalizado' : 'Pendiente'}>
                {finished ? (
                  <CircleCheck size={20} className="text-pitch-light" />
                ) : (
                  <CircleDashed size={20} className="text-mist/50" />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

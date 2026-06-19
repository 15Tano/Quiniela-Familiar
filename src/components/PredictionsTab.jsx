import { useMemo, useState } from 'react'
import { Lock, ClipboardList } from 'lucide-react'
import TeamTag from './TeamTag'
import { hasPrediction, isMatchFinished } from '../utils/scoring'

function ScoreInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : Math.max(0, Math.min(99, Number(v))))
      }}
      className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-1.5 font-display font-bold text-lg text-ink focus:bg-white/20 outline-none disabled:opacity-50 [color-scheme:dark]"
    />
  )
}

export default function PredictionsTab({ participants, matches, predictions, setPredictions }) {
  const [selectedId, setSelectedId] = useState(participants[0]?.id ?? '')

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [matches]
  )

  if (participants.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-mist">
        Primero agrega participantes en la pestaña <span className="text-ink font-semibold">Participantes</span>.
      </div>
    )
  }

  const activeId = participants.some((p) => p.id === selectedId) ? selectedId : participants[0].id
  const myPredictions = predictions[activeId] || {}
  const completed = sortedMatches.filter((m) => hasPrediction(myPredictions[m.id])).length

  function updatePrediction(matchId, field, value) {
    setPredictions((prev) => {
      const current = prev[activeId]?.[matchId] || { scoreA: null, scoreB: null }
      return {
        ...prev,
        [activeId]: {
          ...prev[activeId],
          [matchId]: { ...current, [field]: value },
        },
      }
    })
  }

  return (
    <div className="space-y-5">
      <section className="glass-strong rounded-3xl p-5 sm:p-6">
        <h2 className="font-heading text-xl font-bold text-ink mb-1 flex items-center gap-2">
          <ClipboardList size={20} className="text-pitch-light" /> Predicciones por participante
        </h2>
        <p className="text-sm text-mist mb-4">
          Elige quién está apostando y captura el marcador que cree que va a pasar en cada partido.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={activeId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-ink font-heading font-semibold outline-none [color-scheme:dark]"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id} className="text-night">
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-pitch-light transition-all"
                style={{ width: `${(completed / Math.max(sortedMatches.length, 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs text-mist font-heading whitespace-nowrap">
              {completed}/{sortedMatches.length} listos
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedMatches.map((m) => {
          const pred = myPredictions[m.id] || { scoreA: null, scoreB: null }
          const locked = isMatchFinished(m)
          return (
            <div key={m.id} className="glass rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <TeamTag name={m.teamA} size="sm" />
                <TeamTag name={m.teamB} align="right" size="sm" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <ScoreInput
                  value={pred.scoreA}
                  disabled={locked}
                  onChange={(v) => updatePrediction(m.id, 'scoreA', v)}
                />
                <span className="text-mist font-heading">-</span>
                <ScoreInput
                  value={pred.scoreB}
                  disabled={locked}
                  onChange={(v) => updatePrediction(m.id, 'scoreB', v)}
                />
              </div>
              {locked && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gold-light font-heading">
                  <Lock size={12} /> Partido jugado: {m.resultA}-{m.resultB}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, CalendarClock } from 'lucide-react'
import TeamTag from './TeamTag'
import { ALL_TEAM_NAMES } from '../data/teams'

function formatDate(iso) {
  if (!iso) return 'Sin fecha'
  const d = new Date(iso)
  return d.toLocaleString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const emptyForm = { teamA: '', teamB: '', datetime: '', group: '' }

export default function MatchesTab({ matches, setMatches }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)

  const sorted = useMemo(
    () => [...matches].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [matches]
  )

  function addMatch(e) {
    e.preventDefault()
    if (!form.teamA.trim() || !form.teamB.trim()) return
    const newMatch = {
      id: `m-${Date.now()}`,
      teamA: form.teamA.trim(),
      teamB: form.teamB.trim(),
      datetime: form.datetime ? new Date(form.datetime).toISOString() : null,
      group: form.group.trim(),
      resultA: null,
      resultB: null,
    }
    setMatches((prev) => [...prev, newMatch])
    setForm(emptyForm)
  }

  function removeMatch(id) {
    setMatches((prev) => prev.filter((m) => m.id !== id))
  }

  function startEdit(match) {
    setEditingId(match.id)
    setEditForm({
      teamA: match.teamA,
      teamB: match.teamB,
      datetime: toLocalInputValue(match.datetime),
      group: match.group || '',
    })
  }

  function saveEdit() {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              teamA: editForm.teamA.trim() || m.teamA,
              teamB: editForm.teamB.trim() || m.teamB,
              datetime: editForm.datetime ? new Date(editForm.datetime).toISOString() : null,
              group: editForm.group.trim(),
            }
          : m
      )
    )
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5 sm:p-6">
        <h2 className="font-heading text-xl font-bold text-ink mb-1">Agregar partido</h2>
        <p className="text-sm text-mist mb-4">
          Captura los partidos conforme se vayan anunciando. La banderita se asigna sola.
        </p>
        <form onSubmit={addMatch} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-mist font-heading">Local</label>
            <input
              list="teams-list"
              value={form.teamA}
              onChange={(e) => setForm((f) => ({ ...f, teamA: e.target.value }))}
              placeholder="Ej. Argentina"
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-ink placeholder:text-mist/60 focus:bg-white/10 outline-none"
            />
          </div>
          <span className="hidden sm:block text-mist font-heading font-bold pb-2.5 text-center">vs</span>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-mist font-heading">Visitante</label>
            <input
              list="teams-list"
              value={form.teamB}
              onChange={(e) => setForm((f) => ({ ...f, teamB: e.target.value }))}
              placeholder="Ej. Brasil"
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-ink placeholder:text-mist/60 focus:bg-white/10 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-1">
            <label className="text-xs uppercase tracking-wide text-mist font-heading">Fecha y hora</label>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-ink focus:bg-white/10 outline-none [color-scheme:dark]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-mist font-heading">Grupo (opcional)</label>
            <input
              value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              placeholder="Ej. Grupo A"
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-ink placeholder:text-mist/60 focus:bg-white/10 outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-pitch text-night font-heading font-bold rounded-xl px-4 py-2.5 hover:bg-pitch-light transition-colors"
          >
            <Plus size={18} /> Agregar
          </button>
        </form>
        <datalist id="teams-list">
          {ALL_TEAM_NAMES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-xl font-bold text-ink">Calendario ({sorted.length})</h2>
        </div>

        {sorted.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-mist">
            Todavía no hay partidos. Agrega el primero arriba.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((m) => {
            const isEditing = editingId === m.id
            const isPlayed = m.resultA !== null && m.resultA !== undefined
            return (
              <div key={m.id} className="glass rounded-2xl p-4 flex flex-col gap-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      list="teams-list"
                      value={editForm.teamA}
                      onChange={(e) => setEditForm((f) => ({ ...f, teamA: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      list="teams-list"
                      value={editForm.teamB}
                      onChange={(e) => setEditForm((f) => ({ ...f, teamB: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-ink"
                    />
                    <input
                      type="datetime-local"
                      value={editForm.datetime}
                      onChange={(e) => setEditForm((f) => ({ ...f, datetime: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-ink [color-scheme:dark]"
                    />
                    <input
                      value={editForm.group}
                      onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
                      placeholder="Grupo"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-ink"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-white/10 text-mist hover:text-ink"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={saveEdit}
                        className="p-1.5 rounded-lg bg-pitch text-night"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <TeamTag name={m.teamA} size="sm" />
                      <span className="font-heading text-mist text-xs">vs</span>
                      <TeamTag name={m.teamB} align="right" size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-mist">
                      <span className="flex items-center gap-1">
                        <CalendarClock size={13} /> {formatDate(m.datetime)}
                      </span>
                      {m.group && <span className="px-2 py-0.5 rounded-full bg-white/10">{m.group}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-heading font-semibold px-2 py-1 rounded-full ${
                          isPlayed ? 'bg-pitch/20 text-pitch-light' : 'bg-gold/15 text-gold-light'
                        }`}
                      >
                        {isPlayed ? `Final ${m.resultA}-${m.resultB}` : 'Pendiente'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(m)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-mist hover:text-ink"
                          aria-label="Editar partido"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeMatch(m.id)}
                          className="p-1.5 rounded-lg hover:bg-coral/20 text-mist hover:text-coral"
                          aria-label="Eliminar partido"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// Partidos iniciales de la fase de grupos.
// Las fechas son orientativas (a partir de mañana) y se pueden editar
// libremente desde la pestaña "Partidos".

const raw = [
  ['República Checa', 'Sudáfrica'],
  ['Suiza', 'Bosnia y Herzegovina'],
  ['Canadá', 'Qatar'],
  ['México', 'Corea del Sur'],
  ['EUA', 'Australia'],
  ['Escocia', 'Marruecos'],
  ['Brasil', 'Haití'],
  ['Turquía', 'Paraguay'],
  ['Países Bajos', 'Suecia'],
  ['Alemania', 'Costa de Marfil'],
  ['Ecuador', 'Curaçao'],
  ['Túnez', 'Japón'],
  ['España', 'Arabia Saudita'],
  ['Bélgica', 'Irán'],
  ['Uruguay', 'Cabo Verde'],
  ['Nueva Zelanda', 'Egipto'],
  ['Argentina', 'Austria'],
  ['Francia', 'Iraq'],
  ['Noruega', 'Senegal'],
  ['Jordania', 'Argelia'],
  ['Portugal', 'Uzbekistan'],
  ['Inglaterra', 'Ghana'],
  ['Panamá', 'Croacia'],
  ['Colombia', 'RD Congo'],
]

function startOfTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(13, 0, 0, 0)
  return d
}

const MATCHES_PER_DAY = 4
const HOURS = [13, 16, 19, 22]

export const INITIAL_MATCHES = raw.map(([teamA, teamB], i) => {
  const dayOffset = Math.floor(i / MATCHES_PER_DAY)
  const hour = HOURS[i % MATCHES_PER_DAY]
  const date = startOfTomorrow()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, 0, 0, 0)

  return {
    id: `m-${i + 1}`,
    teamA,
    teamB,
    datetime: date.toISOString(),
    group: '',
    resultA: null,
    resultB: null,
  }
})

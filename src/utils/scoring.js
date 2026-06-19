// Reglas de la quiniela:
//   - Marcador exacto correcto  -> 2 puntos
//   - Sólo el ganador correcto  -> 1 punto
//   - Ninguno de los dos        -> 0 puntos

function outcome(scoreA, scoreB) {
  if (scoreA > scoreB) return 'A'
  if (scoreA < scoreB) return 'B'
  return 'DRAW'
}

export function isMatchFinished(match) {
  return match.resultA !== null && match.resultA !== undefined &&
    match.resultB !== null && match.resultB !== undefined
}

export function hasPrediction(pred) {
  return !!pred && pred.scoreA !== null && pred.scoreA !== undefined &&
    pred.scoreB !== null && pred.scoreB !== undefined
}

// Devuelve { points, label } para una predicción contra un resultado real.
export function scorePrediction(pred, match) {
  if (!isMatchFinished(match) || !hasPrediction(pred)) {
    return { points: 0, label: 'pendiente' }
  }
  const real = outcome(match.resultA, match.resultB)
  const guess = outcome(pred.scoreA, pred.scoreB)

  if (pred.scoreA === match.resultA && pred.scoreB === match.resultB) {
    return { points: 2, label: 'exacto' }
  }
  if (real === guess) {
    return { points: 1, label: 'ganador' }
  }
  return { points: 0, label: 'fallo' }
}

// Calcula la tabla general: puntos totales y desglose por participante.
export function buildLeaderboard(participants, matches, predictions) {
  return participants
    .map((p) => {
      let points = 0
      let exact = 0
      let winnerOnly = 0
      let misses = 0
      let pending = 0

      matches.forEach((match) => {
        const pred = predictions?.[p.id]?.[match.id]
        if (!isMatchFinished(match)) {
          if (hasPrediction(pred)) pending += 1
          return
        }
        const { points: pts, label } = scorePrediction(pred, match)
        points += pts
        if (label === 'exacto') exact += 1
        else if (label === 'ganador') winnerOnly += 1
        else if (label === 'fallo') misses += 1
      })

      return { ...p, points, exact, winnerOnly, misses, pending }
    })
    .sort((a, b) => b.points - a.points || b.exact - a.exact)
}

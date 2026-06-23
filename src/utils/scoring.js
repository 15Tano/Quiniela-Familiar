// Reglas de la quiniela:
//   - Marcador exacto correcto  -> 2 puntos
//   - Sólo el ganador correcto  -> 1 punto
//   - Ninguno de los dos        -> 0 puntos

function outcome(scoreA, scoreB) {
  if (scoreA > scoreB) return "A";
  if (scoreA < scoreB) return "B";
  return "DRAW";
}

export function isMatchFinished(match) {
  return (
    match.resultA !== null &&
    match.resultA !== undefined &&
    match.resultB !== null &&
    match.resultB !== undefined
  );
}

export function hasPrediction(pred) {
  return (
    !!pred &&
    pred.scoreA !== null &&
    pred.scoreA !== undefined &&
    pred.scoreB !== null &&
    pred.scoreB !== undefined
  );
}

// Devuelve { points, label } para una predicción contra un resultado real.
export function scorePrediction(pred, match) {
  if (!isMatchFinished(match) || !hasPrediction(pred)) {
    return { points: 0, label: "pendiente" };
  }
  const real = outcome(match.resultA, match.resultB);
  const guess = outcome(pred.scoreA, pred.scoreB);

  if (pred.scoreA === match.resultA && pred.scoreB === match.resultB) {
    return { points: 2, label: "exacto" };
  }
  if (real === guess) {
    return { points: 1, label: "ganador" };
  }
  return { points: 0, label: "fallo" };
}

// ── Nuevas utilidades ────────────────────────────────────────────────────────

// Devuelve los partidos jugados ordenados cronológicamente.
export function getFinishedMatches(matches) {
  return [...matches]
    .filter(isMatchFinished)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

// Racha de exactos consecutivos al final de los partidos jugados.
// Recorre al revés y para en cuanto no es exacto.
function calcExactStreak(participantId, finishedMatches, predictions) {
  let streak = 0;
  for (let i = finishedMatches.length - 1; i >= 0; i--) {
    const match = finishedMatches[i];
    const pred = predictions?.[participantId]?.[match.id];
    const { label } = scorePrediction(pred, match);
    if (label === "exacto") {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Tendencia: compara puntos en los últimos 3 partidos vs los 3 anteriores.
// Devuelve 'up', 'down' o 'neutral'.
function calcTrend(participantId, finishedMatches, predictions) {
  if (finishedMatches.length < 2) return "neutral";

  const recent = finishedMatches.slice(-3);
  const previous = finishedMatches.slice(-6, -3);

  const sum = (matches) =>
    matches.reduce((acc, match) => {
      const pred = predictions?.[participantId]?.[match.id];
      const { points } = scorePrediction(pred, match);
      return acc + points;
    }, 0);

  const recentPts = sum(recent);
  const prevPts = sum(previous);

  if (previous.length === 0) return "neutral";
  if (recentPts > prevPts) return "up";
  if (recentPts < prevPts) return "down";
  return "neutral";
}

// ¿Acertó el ganador o el exacto en el último partido jugado?
function calcLastCorrect(participantId, finishedMatches, predictions) {
  if (finishedMatches.length === 0) return false;
  const lastMatch = finishedMatches[finishedMatches.length - 1];
  const pred = predictions?.[participantId]?.[lastMatch.id];
  const { label } = scorePrediction(pred, lastMatch);
  return label === "exacto" || label === "ganador";
}

// Cuántos partidos consecutivos lleva el mismo participante en 1er lugar.
// Recorre los partidos jugados uno a uno y recalcula el ranking parcial.
export function getLeaderStreak(participants, matches, predictions) {
  const finished = getFinishedMatches(matches);
  if (finished.length === 0) return { leaderId: null, streak: 0 };

  let streak = 0;
  let currentLeaderId = null;

  for (let i = finished.length; i >= 1; i--) {
    const subset = finished.slice(0, i);
    const partialBoard = participants
      .map((p) => {
        let pts = 0;
        let exact = 0;
        subset.forEach((match) => {
          const pred = predictions?.[p.id]?.[match.id];
          const { points, label } = scorePrediction(pred, match);
          pts += points;
          if (label === "exacto") exact++;
        });
        return { id: p.id, pts, exact };
      })
      .sort((a, b) => b.pts - a.pts || b.exact - a.exact);

    const leaderId = partialBoard[0]?.id;

    if (i === finished.length) {
      // Primera iteración: establecer líder actual
      currentLeaderId = leaderId;
      streak = 1;
    } else if (leaderId === currentLeaderId) {
      streak++;
    } else {
      break;
    }
  }

  return { leaderId: currentLeaderId, streak };
}

// Próximo partido sin resultado, ordenado por fecha.
export function getNextMatch(matches) {
  const pending = matches
    .filter((m) => !isMatchFinished(m) && m.datetime)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return pending[0] ?? null;
}

// Calcula la tabla general: puntos totales y desglose por participante.
export function buildLeaderboard(participants, matches, predictions) {
  const finished = getFinishedMatches(matches);

  return participants
    .map((p) => {
      let points = 0;
      let exact = 0;
      let winnerOnly = 0;
      let misses = 0;
      let pending = 0;

      matches.forEach((match) => {
        const pred = predictions?.[p.id]?.[match.id];
        if (!isMatchFinished(match)) {
          if (hasPrediction(pred)) pending += 1;
          return;
        }
        const { points: pts, label } = scorePrediction(pred, match);
        points += pts;
        if (label === "exacto") exact += 1;
        else if (label === "ganador") winnerOnly += 1;
        else if (label === "fallo") misses += 1;
      });

      // Nuevos campos
      const exactStreak = calcExactStreak(p.id, finished, predictions);
      const trend = calcTrend(p.id, finished, predictions);
      const lastCorrect = calcLastCorrect(p.id, finished, predictions);

      return {
        ...p,
        points,
        exact,
        winnerOnly,
        misses,
        pending,
        exactStreak,
        trend,
        lastCorrect,
      };
    })
    .sort((a, b) => b.points - a.points || b.exact - a.exact);
}

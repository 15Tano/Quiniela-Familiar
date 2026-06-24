import { useEffect, useRef, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured, ROOM_ID } from "../firebase/config";
import { INITIAL_MATCHES } from "../data/initialMatches";

const EMPTY_STATE = {
  matches: INITIAL_MATCHES,
  participants: [],
  predictions: {},
  currentRound: 1,
  rounds: [], // [{ number, winners: [{participantId, name, points}], endedAt }]
};

export function useSharedQuiniela() {
  const [data, setData] = useState(EMPTY_STATE);
  const [status, setStatus] = useState(
    isFirebaseConfigured ? "connecting" : "no-config",
  );
  const latestRef = useRef(EMPTY_STATE);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const ref = doc(db, "quinielas", ROOM_ID);

    const unsubscribe = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          try {
            await setDoc(ref, { ...EMPTY_STATE, updatedAt: serverTimestamp() });
          } catch {
            setStatus("error");
          }
          return;
        }
        const next = {
          matches: snap.data().matches ?? [],
          participants: snap.data().participants ?? [],
          predictions: snap.data().predictions ?? {},
          currentRound: snap.data().currentRound ?? 1,
          rounds: snap.data().rounds ?? [],
        };
        latestRef.current = next;
        setData(next);
        setStatus("ready");
      },
      () => setStatus("error"),
    );

    return () => unsubscribe();
  }, []);

  function writeField(field, updater) {
    if (!isFirebaseConfigured) return;
    const current = latestRef.current[field];
    const next = typeof updater === "function" ? updater(current) : updater;
    latestRef.current = { ...latestRef.current, [field]: next };
    setData({ ...latestRef.current });
    const ref = doc(db, "quinielas", ROOM_ID);
    updateDoc(ref, { [field]: next, updatedAt: serverTimestamp() }).catch(
      () => {
        setStatus("error");
      },
    );
  }

  // Publica el ganador de la ronda actual sin resetear nada.
  // winners: [{ participantId, name, points }]
  function publishRoundWinner(winners) {
    if (!isFirebaseConfigured) return;
    const current = latestRef.current;
    const roundNumber = current.currentRound;

    // Busca si ya existe una entrada para esta ronda y la reemplaza
    const existingRounds = current.rounds ?? [];
    const otherRounds = existingRounds.filter((r) => r.number !== roundNumber);
    const newEntry = {
      number: roundNumber,
      winners,
      publishedAt: new Date().toISOString(),
    };
    const nextRounds = [...otherRounds, newEntry];

    latestRef.current = { ...current, rounds: nextRounds };
    setData({ ...latestRef.current });
    const ref = doc(db, "quinielas", ROOM_ID);
    updateDoc(ref, { rounds: nextRounds, updatedAt: serverTimestamp() }).catch(
      () => {
        setStatus("error");
      },
    );
  }

  // Inicia una nueva ronda: resetea resultados y sube el contador.
  function startNewRound() {
    if (!isFirebaseConfigured) return;
    const current = latestRef.current;
    const nextRound = (current.currentRound ?? 1) + 1;

    // Resetea resultA y resultB de todos los partidos
    const resetMatches = current.matches.map((m) => ({
      ...m,
      resultA: null,
      resultB: null,
    }));

    const next = {
      ...current,
      matches: resetMatches,
      currentRound: nextRound,
    };
    latestRef.current = next;
    setData({ ...next });
    const ref = doc(db, "quinielas", ROOM_ID);
    updateDoc(ref, {
      matches: resetMatches,
      currentRound: nextRound,
      updatedAt: serverTimestamp(),
    }).catch(() => setStatus("error"));
  }

  function replaceAll({ matches, participants, predictions }) {
    if (!isFirebaseConfigured) return;
    const next = {
      matches,
      participants,
      predictions,
      currentRound: latestRef.current.currentRound ?? 1,
      rounds: latestRef.current.rounds ?? [],
    };
    latestRef.current = next;
    setData(next);
    const ref = doc(db, "quinielas", ROOM_ID);
    setDoc(ref, { ...next, updatedAt: serverTimestamp() }).catch(() => {
      setStatus("error");
    });
  }

  return {
    matches: data.matches,
    participants: data.participants,
    predictions: data.predictions,
    currentRound: data.currentRound,
    rounds: data.rounds,
    setMatches: (updater) => writeField("matches", updater),
    setParticipants: (updater) => writeField("participants", updater),
    setPredictions: (updater) => writeField("predictions", updater),
    publishRoundWinner,
    startNewRound,
    replaceAll,
    status,
  };
}

import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured, ROOM_ID } from '../firebase/config'
import { INITIAL_MATCHES } from '../data/initialMatches'

const EMPTY_STATE = {
  matches: INITIAL_MATCHES,
  participants: [],
  predictions: {},
}

// Sincroniza la quiniela completa (partidos, participantes, predicciones)
// contra un solo documento compartido en Firestore, en tiempo real, para
// que todos los que abran la app desde su celular vean lo mismo al mismo
// tiempo, sin necesidad de servidor propio.
export function useSharedQuiniela() {
  const [data, setData] = useState(EMPTY_STATE)
  const [status, setStatus] = useState(
    isFirebaseConfigured ? 'connecting' : 'no-config'
  )
  const latestRef = useRef(EMPTY_STATE)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const ref = doc(db, 'quinielas', ROOM_ID)

    const unsubscribe = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // Primera vez que se usa este "cuarto": se siembra con los
          // partidos iniciales y listas vacías.
          try {
            await setDoc(ref, { ...EMPTY_STATE, updatedAt: serverTimestamp() })
          } catch {
            setStatus('error')
          }
          return
        }
        const next = {
          matches: snap.data().matches ?? [],
          participants: snap.data().participants ?? [],
          predictions: snap.data().predictions ?? {},
        }
        latestRef.current = next
        setData(next)
        setStatus('ready')
      },
      () => setStatus('error')
    )

    return () => unsubscribe()
  }, [])

  function writeField(field, updater) {
    if (!isFirebaseConfigured) return
    const current = latestRef.current[field]
    const next = typeof updater === 'function' ? updater(current) : updater
    latestRef.current = { ...latestRef.current, [field]: next }
    setData(latestRef.current)
    const ref = doc(db, 'quinielas', ROOM_ID)
    updateDoc(ref, { [field]: next, updatedAt: serverTimestamp() }).catch(() => {
      setStatus('error')
    })
  }

  // Reemplaza los tres campos a la vez (usado al importar un respaldo JSON).
  function replaceAll({ matches, participants, predictions }) {
    if (!isFirebaseConfigured) return
    const next = { matches, participants, predictions }
    latestRef.current = next
    setData(next)
    const ref = doc(db, 'quinielas', ROOM_ID)
    setDoc(ref, { ...next, updatedAt: serverTimestamp() }).catch(() => {
      setStatus('error')
    })
  }

  return {
    matches: data.matches,
    participants: data.participants,
    predictions: data.predictions,
    setMatches: (updater) => writeField('matches', updater),
    setParticipants: (updater) => writeField('participants', updater),
    setPredictions: (updater) => writeField('predictions', updater),
    replaceAll,
    status, // 'no-config' | 'connecting' | 'ready' | 'error'
  }
}

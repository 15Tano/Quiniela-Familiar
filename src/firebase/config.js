import { initializeApp, getApps } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// Credenciales del proyecto de Firebase, tomadas de variables de entorno
// (ver .env.example). Nunca van hardcodeadas aquí.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// true si ya se capturaron las 6 variables necesarias en .env / Vercel
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

// Identificador del "cuarto" compartido en Firestore. Si tu familia llegara
// a usar esta misma app para más de una quiniela a la vez, cambia este valor
// (VITE_QUINIELA_ROOM) en cada despliegue para no mezclar los datos.
export const ROOM_ID = import.meta.env.VITE_QUINIELA_ROOM || 'familiar'

let app = null
let db = null

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  // Cache local persistente: si se cae el wifi a medio asado familiar,
  // la app sigue funcionando con lo último visto y se sincroniza solita
  // en cuanto vuelve la conexión.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
}

export { app, db }

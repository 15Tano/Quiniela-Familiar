import { AlertTriangle } from 'lucide-react'

// Pantalla de ayuda que se muestra si todavía no se han configurado las
// variables de entorno de Firebase. Sin esto la app no tiene dónde guardar
// los datos compartidos.
export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="stadium-bg" />
      <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 shrink-0 rounded-2xl bg-gold/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-gold-light" />
          </span>
          <h1 className="font-heading text-xl font-bold text-ink">
            Falta conectar la base de datos
          </h1>
        </div>
        <p className="text-sm text-mist leading-relaxed">
          Para que la tabla se vea en vivo en el celular de toda la familia, esta app
          necesita un proyecto de Firebase (gratis) y sus credenciales en un archivo{' '}
          <code className="px-1 py-0.5 rounded bg-white/10 text-ink">.env</code>.
        </p>
        <ol className="text-sm text-mist leading-relaxed list-decimal list-inside space-y-1.5">
          <li>Crea un proyecto en console.firebase.google.com (es gratis).</li>
          <li>Activa <span className="text-ink">Firestore Database</span> en modo producción.</li>
          <li>Agrega una app web y copia sus credenciales.</li>
          <li>
            Pega esas credenciales en <code className="px-1 py-0.5 rounded bg-white/10 text-ink">.env</code>{' '}
            (copia <code className="px-1 py-0.5 rounded bg-white/10 text-ink">.env.example</code>).
          </li>
          <li>Reinicia <code className="px-1 py-0.5 rounded bg-white/10 text-ink">npm run dev</code>.</li>
        </ol>
        <p className="text-xs text-mist/70">
          El paso a paso completo, con las reglas de seguridad de Firestore, está en el README del proyecto.
        </p>
      </div>
    </div>
  )
}

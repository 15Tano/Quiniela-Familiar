import { Wifi, WifiOff, Loader2 } from 'lucide-react'

const CONFIG = {
  ready: { icon: Wifi, text: 'En vivo', dot: 'bg-pitch-light', color: 'text-pitch-light' },
  connecting: { icon: Loader2, text: 'Conectando…', dot: 'bg-gold-light', color: 'text-gold-light', spin: true },
  error: { icon: WifiOff, text: 'Sin conexión', dot: 'bg-coral', color: 'text-coral' },
}

export default function ConnectionStatus({ status }) {
  const cfg = CONFIG[status] || CONFIG.connecting
  const Icon = cfg.icon
  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] font-heading font-semibold ${cfg.color}`}
      title={
        status === 'ready'
          ? 'Conectado: todos ven los mismos datos en tiempo real'
          : status === 'error'
          ? 'No se pudo conectar a la base de datos. Revisa tu internet o la configuración de Firebase.'
          : 'Conectando con la base de datos compartida…'
      }
    >
      <Icon size={13} className={cfg.spin ? 'animate-spin' : ''} />
      {cfg.text}
    </span>
  )
}

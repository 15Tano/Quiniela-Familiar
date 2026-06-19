import { useEffect, useRef, useState } from "react";
import { Lock, X } from "lucide-react";

export default function AdminPinModal({
  open,
  pinConfigured,
  onClose,
  onSubmit,
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // El modal se desmonta por completo cuando está cerrado (return null más
  // abajo), así que al volver a abrirse es un mount nuevo: pin y error ya
  // arrancan limpios solos, sin necesidad de resetearlos aquí.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!pinConfigured) return;
    const ok = onSubmit(pin);
    if (!ok) {
      setError("PIN incorrecto");
      setPin("");
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night/70 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Acceso de administrador"
    >
      <div
        className="glass-strong rounded-3xl p-6 w-full max-w-xs space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-pitch/20 flex items-center justify-center shrink-0">
              <Lock size={17} className="text-pitch-light" />
            </span>
            <h2 className="font-heading text-lg font-bold text-ink">
              Acceso Admin
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mist hover:text-ink hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {pinConfigured ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              placeholder="PIN"
              className="w-full text-center tracking-[0.5em] bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-ink font-display text-xl outline-none focus:bg-white/15 [color-scheme:dark]"
            />
            {error && <p className="text-xs text-coral text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-pitch text-night font-heading font-bold rounded-xl py-2.5 hover:bg-pitch-light transition-colors"
            >
              Entrar
            </button>
          </form>
        ) : (
          <p className="text-sm text-mist leading-relaxed">
            Todavía no configuras un PIN. Agrega{" "}
            <code className="px-1 py-0.5 rounded bg-white/10 text-ink">
              VITE_ADMIN_PIN
            </code>{" "}
            en tu archivo{" "}
            <code className="px-1 py-0.5 rounded bg-white/10 text-ink">
              .env
            </code>{" "}
            (y en Vercel) para poder entrar como administrador.
          </p>
        )}
      </div>
    </div>
  );
}

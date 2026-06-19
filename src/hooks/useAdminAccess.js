import { useCallback, useState } from "react";

const STORAGE_KEY = "quiniela:isAdmin";
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "";

// Acceso de administrador protegido por PIN (definido en .env, nunca en
// el código). Una vez correcto, se queda "entrado" en ese dispositivo
// (localStorage) hasta que el usuario le dé "Salir" explícitamente.
export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const unlock = useCallback((pin) => {
    if (!ADMIN_PIN || pin !== ADMIN_PIN) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // si localStorage no está disponible, igual dejamos pasar para esta sesión
    }
    setIsAdmin(true);
    return true;
  }, []);

  const lock = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
    setIsAdmin(false);
  }, []);

  return { isAdmin, unlock, lock, pinConfigured: !!ADMIN_PIN };
}

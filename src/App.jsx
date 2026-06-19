import { useRef, useState } from "react";
import { Trophy, Download, Upload } from "lucide-react";
import { useSharedQuiniela } from "./hooks/useSharedQuiniela";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { exportBackup, readBackupFile } from "./utils/backup";
import { INITIAL_MATCHES } from "./data/initialMatches";
import NavTabs from "./components/NavTabs";
import LeaderboardTab from "./components/LeaderboardTab";
import MatchesTab from "./components/MatchesTab";
import ParticipantsTab from "./components/ParticipantsTab";
import PredictionsTab from "./components/PredictionsTab";
import ResultsTab from "./components/ResultsTab";
import ConnectionStatus from "./components/ConnectionStatus";
import SetupNotice from "./components/SetupNotice";
import AdminPinModal from "./components/AdminPinModal";

const ADMIN_ONLY_TABS = new Set(["partidos", "participantes", "resultados"]);

export default function App() {
  const { isAdmin, unlock, lock, pinConfigured } = useAdminAccess();
  const [tab, setTab] = useState(() => (isAdmin ? "tabla" : "predicciones"));
  const [showPinModal, setShowPinModal] = useState(false);
  const {
    matches,
    participants,
    predictions,
    setMatches,
    setParticipants,
    setPredictions,
    replaceAll,
    status,
  } = useSharedQuiniela();
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  // Si alguien sale del modo admin (o nunca entró) y se había quedado en
  // una pestaña que ya no le toca ver, la "tab visible" cae a Predicciones
  // sin necesidad de un efecto que dispare otro render.
  const visibleTab =
    !isAdmin && ADMIN_ONLY_TABS.has(tab) ? "predicciones" : tab;

  // Sin credenciales de Firebase no hay dónde guardar datos compartidos:
  // mostramos instrucciones en vez de una app que parece vacía o rota.
  if (status === "no-config") {
    return <SetupNotice />;
  }

  function handleUnlock(pin) {
    const ok = unlock(pin);
    if (ok) {
      setShowPinModal(false);
      setTab("tabla");
    }
    return ok;
  }

  function handleExitAdmin() {
    lock();
    setTab("predicciones");
  }

  function resetAll() {
    const ok = window.confirm(
      "¿Seguro que quieres reiniciar toda la quiniela para TODOS? Esto borra partidos, participantes y predicciones para todos los que tengan el link abierto.",
    );
    if (!ok) return;
    replaceAll({ matches: INITIAL_MATCHES, participants: [], predictions: {} });
  }

  function handleExport() {
    exportBackup({ matches, participants, predictions });
  }

  function handleImportClick() {
    setImportError("");
    fileInputRef.current?.click();
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = await readBackupFile(file);
      const fecha = data.exportedAt
        ? new Date(data.exportedAt).toLocaleString("es-MX")
        : "fecha desconocida";
      const ok = window.confirm(
        `Vas a reemplazar lo que TODOS ven ahora mismo con el respaldo del ${fecha}\n` +
          `(${data.matches.length} partidos, ${data.participants.length} participantes). ¿Continuar?`,
      );
      if (!ok) return;
      replaceAll({
        matches: data.matches,
        participants: data.participants,
        predictions: data.predictions,
      });
      setImportError("");
    } catch (err) {
      setImportError(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="stadium-bg" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32 space-y-6">
        <header className="glass-strong rounded-3xl px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-pitch to-pitch-light flex items-center justify-center shadow-[0_0_18px_rgba(31,174,110,0.45)]">
              <Trophy size={22} className="text-night" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight truncate">
                Quiniela Familiar
              </h1>
              <p className="text-xs text-mist truncate">
                Mundial 2026 · entre nosotros
              </p>
            </div>
          </div>
          <ConnectionStatus status={status} />
        </header>

        <main>
          {visibleTab === "tabla" && (
            <LeaderboardTab
              participants={participants}
              matches={matches}
              predictions={predictions}
            />
          )}
          {isAdmin && visibleTab === "partidos" && (
            <MatchesTab matches={matches} setMatches={setMatches} />
          )}
          {isAdmin && visibleTab === "participantes" && (
            <ParticipantsTab
              participants={participants}
              setParticipants={setParticipants}
            />
          )}
          {visibleTab === "predicciones" && (
            <PredictionsTab
              participants={participants}
              matches={matches}
              predictions={predictions}
              setPredictions={setPredictions}
            />
          )}
          {isAdmin && visibleTab === "resultados" && (
            <ResultsTab matches={matches} setMatches={setMatches} />
          )}
        </main>

        {isAdmin && (
          <footer className="text-center pt-2 pb-2 space-y-3">
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs text-mist hover:text-pitch-light transition-colors"
              >
                <Download size={13} /> Exportar datos
              </button>
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 text-xs text-mist hover:text-pitch-light transition-colors"
              >
                <Upload size={13} /> Importar datos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
            {importError && <p className="text-xs text-coral">{importError}</p>}
            <button
              onClick={resetAll}
              className="text-[11px] text-mist/60 hover:text-coral transition-colors underline-offset-2 hover:underline"
            >
              Reiniciar todos los datos (para todos)
            </button>
          </footer>
        )}
      </div>

      <NavTabs
        active={visibleTab}
        onChange={setTab}
        isAdmin={isAdmin}
        onRequestAdmin={() => setShowPinModal(true)}
        onExitAdmin={handleExitAdmin}
      />

      <AdminPinModal
        open={showPinModal}
        pinConfigured={pinConfigured}
        onClose={() => setShowPinModal(false)}
        onSubmit={handleUnlock}
      />
    </div>
  );
}

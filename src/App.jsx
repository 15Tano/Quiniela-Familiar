import { useRef, useState } from "react";
import { Trophy, Download, Upload } from "lucide-react";
import MatchViewTab from "./components/MatchViewTab";

// 1. Importaciones para el Batch de Firebase
import { writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase/config"; // <-- OJO: Verifica que esta ruta apunte a tu archivo de config de Firebase

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

// 2. Aquí pegas toda tu lista de partidos
const todosLosPartidos = [
  {
    datetime: null,
    group: "",
    id: "m-25",
    resultA: null,
    resultB: null,
    teamA: "Suiza",
    teamB: "Canadá",
  },
  {
    datetime: null,
    group: "",
    id: "m-26",
    resultA: null,
    resultB: null,
    teamA: "Bosnia y H.",
    teamB: "Catar",
  },
  {
    datetime: null,
    group: "",
    id: "m-27",
    resultA: null,
    resultB: null,
    teamA: "Marruecos",
    teamB: "Haití",
  },
  {
    datetime: null,
    group: "",
    id: "m-28",
    resultA: null,
    resultB: null,
    teamA: "Escocia",
    teamB: "Brasil",
  },
  {
    datetime: null,
    group: "",
    id: "m-29",
    resultA: null,
    resultB: null,
    teamA: "Sudáfrica",
    teamB: "Corea del Sur",
  },
  {
    datetime: null,
    group: "",
    id: "m-30",
    resultA: null,
    resultB: null,
    teamA: "Chequia",
    teamB: "México",
  },
  {
    datetime: null,
    group: "",
    id: "m-31",
    resultA: null,
    resultB: null,
    teamA: "Curazao",
    teamB: "Costa de Marfil",
  },
  {
    datetime: null,
    group: "",
    id: "m-32",
    resultA: null,
    resultB: null,
    teamA: "Ecuador",
    teamB: "Alemania",
  },
  {
    datetime: null,
    group: "",
    id: "m-33",
    resultA: null,
    resultB: null,
    teamA: "Túnez",
    teamB: "Países Bajos",
  },
  {
    datetime: null,
    group: "",
    id: "m-34",
    resultA: null,
    resultB: null,
    teamA: "Japón",
    teamB: "Suecia",
  },
  {
    datetime: null,
    group: "",
    id: "m-35",
    resultA: null,
    resultB: null,
    teamA: "Turquía",
    teamB: "USA",
  },
  {
    datetime: null,
    group: "",
    id: "m-36",
    resultA: null,
    resultB: null,
    teamA: "Paraguay",
    teamB: "Australia",
  },
  {
    datetime: null,
    group: "",
    id: "m-37",
    resultA: null,
    resultB: null,
    teamA: "Noruega",
    teamB: "Francia",
  },
  {
    datetime: null,
    group: "",
    id: "m-38",
    resultA: null,
    resultB: null,
    teamA: "Senegal",
    teamB: "Irak",
  },
  {
    datetime: null,
    group: "",
    id: "m-39",
    resultA: null,
    resultB: null,
    teamA: "Cabo Verde",
    teamB: "Arabia Saudita",
  },
  {
    datetime: null,
    group: "",
    id: "m-40",
    resultA: null,
    resultB: null,
    teamA: "Uruguay",
    teamB: "España",
  },
  {
    datetime: null,
    group: "",
    id: "m-41",
    resultA: null,
    resultB: null,
    teamA: "Nueva Zelanda",
    teamB: "Bélgica",
  },
  {
    datetime: null,
    group: "",
    id: "m-42",
    resultA: null,
    resultB: null,
    teamA: "Egipto",
    teamB: "Irán",
  },
  {
    datetime: null,
    group: "",
    id: "m-43",
    resultA: null,
    resultB: null,
    teamA: "Panamá",
    teamB: "Inglaterra",
  },
  {
    datetime: null,
    group: "",
    id: "m-44",
    resultA: null,
    resultB: null,
    teamA: "Croacia",
    teamB: "Ghana",
  },
  {
    datetime: null,
    group: "",
    id: "m-45",
    resultA: null,
    resultB: null,
    teamA: "Colombia",
    teamB: "Portugal",
  },
  {
    datetime: null,
    group: "",
    id: "m-46",
    resultA: null,
    resultB: null,
    teamA: "RD Congo",
    teamB: "Uzbekistán",
  },
  {
    datetime: null,
    group: "",
    id: "m-47",
    resultA: null,
    resultB: null,
    teamA: "Argelia",
    teamB: "Austria",
  },
  {
    datetime: null,
    group: "",
    id: "m-48",
    resultA: null,
    resultB: null,
    teamA: "Jordania",
    teamB: "Argentina",
  },
];

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

  const visibleTab =
    !isAdmin && ADMIN_ONLY_TABS.has(tab) ? "predicciones" : tab;

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

  // 3. Función para subir los partidos de jalón a Firestore
  async function cargarPartidosMasivos() {
    if (todosLosPartidos.length === 0) {
      alert(
        "La lista de partidos está vacía. Agrega los partidos en el código primero.",
      );
      return;
    }

    const ok = window.confirm(
      `¿Seguro que quieres subir ${todosLosPartidos.length} partidos de jalón a Firestore?`,
    );
    if (!ok) return;

    try {
      const batch = writeBatch(db);

      todosLosPartidos.forEach((partido) => {
        // Asegúrate de que 'matches' sea el nombre de tu colección en la BD
        const partidoRef = doc(db, "matches", partido.id);
        batch.set(partidoRef, partido);
      });

      await batch.commit();
      alert(
        "¡Todos los partidos se subieron correctamente a Firestore! Recarga la página para verlos.",
      );
    } catch (error) {
      console.error("Error al subir los partidos: ", error);
      alert("Hubo un error al subir los partidos. Revisa la consola.");
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

          {visibleTab === "vista" && (
            <MatchViewTab
              matches={matches}
              participants={participants}
              predictions={predictions}
            />
          )}

          {isAdmin && visibleTab === "resultados" && (
            <ResultsTab matches={matches} setMatches={setMatches} />
          )}
        </main>

        {isAdmin && (
          <footer className="text-center pt-2 pb-2 space-y-3">
            <div className="flex items-center justify-center gap-5">
              {/* 4. Botón temporal para subir los partidos */}
              <button
                onClick={cargarPartidosMasivos}
                className="flex items-center gap-1.5 text-xs text-night bg-gold px-2 py-1 rounded-md hover:bg-gold-light transition-colors font-bold"
              >
                Subir partidos de jalón
              </button>

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

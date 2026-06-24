import { useRef, useState } from "react";
import { Trophy, Download, Upload } from "lucide-react";

import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase/config";

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
import MatchViewTab from "./components/MatchViewTab";

// Paleta de blobs por ronda: [colorBlob1, colorBlob2]
const ROUND_COLORS = {
  1: ["rgba(31,174,110,0.18)", "rgba(244,183,64,0.14)"], // verde + dorado (original)
  2: ["rgba(59,130,246,0.18)", "rgba(139,92,246,0.14)"], // azul + violeta
  3: ["rgba(239,68,68,0.18)", "rgba(249,115,22,0.14)"], // rojo + naranja
  4: ["rgba(6,182,212,0.18)", "rgba(16,185,129,0.14)"], // cian + esmeralda
};

function getRoundColors(round) {
  return ROUND_COLORS[round] ?? ROUND_COLORS[4];
}

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
  const [tab, setTab] = useState("tabla");
  const [showPinModal, setShowPinModal] = useState(false);
  const {
    matches,
    participants,
    predictions,
    currentRound,
    rounds,
    predictionsClosed,
    setMatches,
    setParticipants,
    setPredictions,
    publishRoundWinner,
    startNewRound,
    togglePredictionsClosed,
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
    setTab("tabla");
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

  async function cargarPartidosMasivos() {
    if (todosLosPartidos.length === 0) {
      alert("La lista de partidos está vacía.");
      return;
    }
    const ok = window.confirm(
      `¿Seguro que quieres agregar ${todosLosPartidos.length} partidos a tu quiniela familiar?`,
    );
    if (!ok) return;
    try {
      const quinielaRef = doc(db, "quinielas", "familiar");
      await updateDoc(quinielaRef, {
        matches: arrayUnion(...todosLosPartidos),
      });
      alert(
        "¡Todos los partidos se agregaron correctamente! Recarga la página para verlos.",
      );
    } catch (error) {
      console.error("Error al subir los partidos: ", error);
      alert("Hubo un error al subir los partidos. Revisa la consola.");
    }
  }

  // Colores del fondo según la ronda actual
  const [blob1, blob2] = getRoundColors(currentRound);

  return (
    <div className="min-h-screen">
      {/* Fondo con colores dinámicos por ronda */}
      <div
        className="stadium-bg"
        style={{
          "--blob1-color": blob1,
          "--blob2-color": blob2,
        }}
      />

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
                Mundial 2026 · Ronda {currentRound}
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
              rounds={rounds}
              currentRound={currentRound}
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
              predictionsClosed={predictionsClosed}
              togglePredictionsClosed={togglePredictionsClosed}
              isAdmin={isAdmin}
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
            <ResultsTab
              matches={matches}
              participants={participants}
              currentRound={currentRound}
              setMatches={setMatches}
              publishRoundWinner={publishRoundWinner}
              startNewRound={startNewRound}
            />
          )}
        </main>

        {isAdmin && (
          <footer className="text-center pt-2 pb-2 space-y-3">
            <div className="flex items-center justify-center gap-5">
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

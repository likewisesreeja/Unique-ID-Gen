import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./pages/Overview";
import Generate from "./pages/Generate";
import Workers from "./pages/Workers";
import Analytics from "./pages/Analytics";
import Algorithms from "./pages/Algorithms";
import {
  generateId as apiGenerate,
  getStatus,
  GeneratedId,
  SystemStatus,
} from "./services/api";

type Page =
  | "overview"
  | "generate"
  | "workers"
  | "analytics"
  | "algorithms";

const initialStatus: SystemStatus = {
  activeServers: 3,
  requestsPerSecond: 0,
  idsGenerated: 0,
  duplicateIds: 0,
  avgLatencyMs: 0,
  peakThroughput: 0,
};

const initialWorkers = [
  { id: "G-001", status: "online", dc: "DC-01" },
  { id: "G-002", status: "online", dc: "DC-01" },
  { id: "G-003", status: "online", dc: "DC-02" },
];

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [lastId, setLastId] = useState<GeneratedId | null>(null);

  const [status, setStatus] = useState<SystemStatus>(initialStatus);

  const [workers, setWorkers] = useState(initialWorkers);

  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    getStatus()
      .then((data) => {
        setStatus(data);
        setApiOnline(true);
      })
      .catch(() => {
        setApiOnline(false);
      });
  }, []);

  const generate = async () => {
    try {
      const result = await apiGenerate();

      setLastId(result);
      setApiOnline(true);

      // Refresh real backend statistics.
      const updatedStatus = await getStatus();
      setStatus(updatedStatus);
    } catch (error) {
      console.error("ID generation failed:", error);
      setApiOnline(false);
    }
  };

  const effectiveStatus = {
    ...status,
    activeServers: workers.filter(
      (worker) => worker.status === "online"
    ).length,
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />

      <main>
        <Topbar
          connected={apiOnline}
          mockMode={!apiOnline}
        />

        {page === "overview" && (
          <Overview
            status={effectiveStatus}
            lastId={lastId}
            workers={workers}
            onGenerate={generate}
            setPage={setPage}
          />
        )}

        {page === "generate" && (
          <Generate
            lastId={lastId}
            onGenerate={generate}
          />
        )}

        {page === "workers" && (
          <Workers
            workers={workers}
            setWorkers={setWorkers}
          />
        )}

        {page === "analytics" && <Analytics />}

        {page === "algorithms" && <Algorithms />}

        <footer>
          SNOWGRID • Distributed ID Generator • Built for system design
          demonstration
        </footer>
      </main>
    </div>
  );
}
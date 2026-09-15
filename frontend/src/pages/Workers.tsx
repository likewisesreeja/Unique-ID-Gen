import {
  Activity,
  Power,
  Server,
  ShieldCheck,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Worker = {
  id: string;
  status: "online" | "offline";
  dc: string;
  machineId: number;
  port: number;
};

const workerConfig: Worker[] = [
  {
    id: "G-001",
    status: "offline",
    dc: "DC-01",
    machineId: 1,
    port: 8081,
  },
  {
    id: "G-002",
    status: "offline",
    dc: "DC-01",
    machineId: 2,
    port: 8082,
  },
  {
    id: "G-003",
    status: "offline",
    dc: "DC-01",
    machineId: 3,
    port: 8083,
  },
];

export default function Workers({
  workers,
  setWorkers,
}: {
  workers: any[];
  setWorkers: any;
}) {
  const [checking, setChecking] = useState(false);

  const checkWorkers = useCallback(async () => {
    setChecking(true);

    const updatedWorkers = await Promise.all(
      workerConfig.map(async (worker) => {
        try {
          const response = await fetch(
            `http://localhost:${worker.port}/api/v1/health`,
            {
              signal: AbortSignal.timeout(3000),
            }
          );

          if (!response.ok) {
            throw new Error("Worker unhealthy");
          }

          return {
            ...worker,
            status: "online" as const,
          };
        } catch {
          return {
            ...worker,
            status: "offline" as const,
          };
        }
      })
    );

    setWorkers(updatedWorkers);
    setChecking(false);
  }, [setWorkers]);

  useEffect(() => {
    checkWorkers();

    const interval = setInterval(checkWorkers, 5000);

    return () => clearInterval(interval);
  }, [checkWorkers]);

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <div className="eyebrow">CLUSTER MANAGEMENT</div>
          <h1>Worker Fleet</h1>
          <p>
            Live health status of the Snowflake generator instances.
          </p>
        </div>

        <div className="fleet-summary">
          <span className="green-dot" />
          {workers.filter((w) => w.status === "online").length} /{" "}
          {workers.length} ONLINE

          <button
            className="secondary-btn"
            onClick={checkWorkers}
            disabled={checking}
            style={{ marginLeft: "12px" }}
          >
            <RefreshCw size={14} />
            {checking ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="worker-grid">
        {workers.map((w: any, i: number) => (
          <div
            className={`panel worker-card ${w.status}`}
            key={w.id}
          >
            <div className="worker-card-top">
              <div className="big-server">
                <Server size={24} />
                <span />
              </div>

              <div>
                <h2>{w.id}</h2>
                <p>
                  {w.dc} • Machine {i + 1} • Port {8081 + i}
                </p>
              </div>

              <div className="status-badge">
                {w.status === "online" ? "ONLINE" : "OFFLINE"}
              </div>
            </div>

            <div className="worker-stats">
              <div>
                <small>ROLE</small>
                <b>ID GENERATOR</b>
              </div>

              <div>
                <small>ALGORITHM</small>
                <b>SNOWFLAKE</b>
              </div>

              <div>
                <small>HEALTH</small>
                <b>
                  {w.status === "online" ? "HEALTHY" : "UNREACHABLE"}
                </b>
              </div>
            </div>

            <div className="worker-health">
              <span>
                <Wifi size={14} /> Health Check
              </span>

              <b>
                {w.status === "online"
                  ? "Responding"
                  : "No response"}
              </b>
            </div>

            <div className="worker-health">
              <span>
                <Activity size={14} /> Endpoint
              </span>

              <b>localhost:{8081 + i}</b>
            </div>

            <button
              className="secondary-btn"
              onClick={checkWorkers}
            >
              <Power size={15} />
              Check Worker
            </button>
          </div>
        ))}
      </div>

      <div className="panel failover">
        <ShieldCheck />

        <div>
          <h3>Failover demonstration</h3>

          <p>
            Worker health is checked directly through each generator's
            health endpoint. If a Docker worker stops responding, its
            status will automatically change to OFFLINE.
          </p>
        </div>
      </div>
    </div>
  );
}
import {
  Check,
  Copy,
  Fingerprint,
  Search,
  Sparkles,
  Layers3,
} from "lucide-react";
import { useState } from "react";
import IdBreakdown from "../components/IdBreakdown";
import { GeneratedId, generateBatch } from "../services/api";

type BatchId = {
  id: string;
  machineId: number;
  datacenterId: number;
  timestampMillis: number;
  sequence: number;
};

export default function Generate({
  lastId,
  onGenerate,
}: {
  lastId: GeneratedId | null;
  onGenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [batchSize, setBatchSize] = useState(10);
  const [batchIds, setBatchIds] = useState<BatchId[]>([]);
  const [loading, setLoading] = useState(false);
  const [decodedId, setDecodedId] = useState<BatchId | null>(null);

  const copy = () => {
    if (lastId) {
      navigator.clipboard?.writeText(lastId.id);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    }
  };

  const createBatch = async () => {
    try {
      setLoading(true);

      const ids = await generateBatch(batchSize);

      setBatchIds(ids);
    } catch (error) {
      console.error("Batch generation failed:", error);
      alert("Batch generation failed. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const decodeId = async () => {
    if (!query.trim()) return;

    try {
      const id = query.trim();

      const response = await fetch(
        `http://localhost:8080/api/v1/ids/${id}/decode`
      );

      if (!response.ok) {
        throw new Error("Invalid ID");
      }

      const data = await response.json();

      setDecodedId({
        id,
        machineId: Number(data.machineId),
        datacenterId: Number(data.datacenterId),
        timestampMillis: Number(data.timestampMillis),
        sequence: Number(data.sequence),
      });
    } catch (error) {
      console.error("Decode failed:", error);
      alert("Could not decode this ID.");
    }
  };

  return (
    <div className="page">
      {/* PAGE HEADER */}
      <div className="page-title">
        <div>
          <div className="eyebrow">ID GENERATOR</div>

          <h1>Generate & Explore</h1>

          <p>
            Generate globally unique IDs and inspect the Snowflake sequence.
          </p>
        </div>
      </div>

      {/* SINGLE ID GENERATION */}
      <div className="generate-grid">
        <section className="panel generator-card">
          <div className="generator-icon">
            <Fingerprint size={29} />
          </div>

          <div className="eyebrow">SNOWFLAKE ENGINE</div>

          <h2>Generate a unique ID</h2>

          <p>
            Send a request through Nginx and let an available worker produce
            the next 64-bit identifier.
          </p>

          <button className="generate-btn" onClick={onGenerate}>
            <Sparkles />
            GENERATE UNIQUE ID
          </button>

          {lastId && (
            <div className="generated-result">
              <span>NEW ID</span>

              <strong>{lastId.id}</strong>

              <button onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}

                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </section>

        {/* ID BREAKDOWN */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>ID Breakdown</h2>

              <p>Fields returned by the backend.</p>
            </div>
          </div>

          <IdBreakdown data={lastId} />
        </section>
      </div>

      {/* BATCH GENERATION */}
      <section className="panel batch-panel">
        <div className="panel-head">
          <div>
            <h2>
              <Layers3 size={20} />
              Batch Generation
            </h2>

            <p>
              Generate multiple IDs and inspect their actual Snowflake
              sequence numbers.
            </p>
          </div>
        </div>

        <div className="batch-controls">
          <label>
            Number of IDs

            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <button
            className="primary-btn"
            onClick={createBatch}
            disabled={loading}
          >
            <Sparkles size={16} />

            {loading ? "GENERATING..." : "GENERATE BATCH"}
          </button>
        </div>

        {batchIds.length > 0 && (
          <div className="sequence-view">
            <div className="sequence-title">
              <span>ACTUAL SNOWFLAKE SEQUENCE</span>

              <b>{batchIds.length} IDs generated</b>
            </div>

            {/* TABLE HEADER */}
            <div className="sequence-row sequence-header">
              <span>SEQUENCE</span>

              <span>WORKER</span>

              <span>GENERATED ID</span>
            </div>

            {/* ACTUAL BACKEND DATA */}
            <div className="sequence-list">
              {batchIds.map((item) => (
                <div className="sequence-row" key={item.id}>
                  <span className="sequence-number">
                    {String(item.sequence).padStart(4, "0")}
                  </span>

                  <span>
                    G-{String(item.machineId).padStart(3, "0")}
                  </span>

                  <code>{item.id}</code>
                </div>
              ))}
            </div>

            {/* SEQUENCE SUMMARY */}
            <div className="sequence-explanation">
              <b>What is happening?</b>

              <p>
                The sequence is generated by the Snowflake algorithm inside
                the worker. When multiple IDs are generated by the same
                worker during the same millisecond, the sequence becomes
                0 → 1 → 2 → 3 → ... .
              </p>

              <p>
                <strong>
                  These numbers are decoded from the actual IDs returned by
                  the backend.
                </strong>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ID EXPLORER */}
      <section className="panel explorer">
        <div className="panel-head">
          <div>
            <h2>ID Explorer</h2>

            <p>Decode any generated Snowflake ID.</p>
          </div>
        </div>

        <div className="searchbox">
          <Search size={17} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                decodeId();
              }
            }}
            placeholder="Paste a generated ID…"
          />

          <button disabled={!query.trim()} onClick={decodeId}>
            Decode ID
          </button>
        </div>

        {decodedId && (
          <div className="decoded-result">
            <div>
              <small>ID</small>

              <code>{decodedId.id}</code>
            </div>

            <div>
              <small>DATACENTER</small>

              <b>{decodedId.datacenterId}</b>
            </div>

            <div>
              <small>WORKER</small>

              <b>{decodedId.machineId}</b>
            </div>

            <div>
              <small>SEQUENCE</small>

              <b>{String(decodedId.sequence).padStart(4, "0")}</b>
            </div>

            <div>
              <small>TIMESTAMP</small>

              <b>{decodedId.timestampMillis}</b>
            </div>
          </div>
        )}

        <div className="notice">
          <Search size={15} />

          Decode endpoint:{" "}
          <code>GET /api/v1/ids/{"{id}"}/decode</code>
        </div>
      </section>
    </div>
  );
}
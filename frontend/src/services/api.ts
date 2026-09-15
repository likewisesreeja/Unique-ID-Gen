export type Algorithm = "SNOWFLAKE" | "UUID" | "DB_COUNTER";

export interface GeneratedId {
  id: string;
  workerId: number;
  timestamp: number;
  sequence: number;
  algorithm: Algorithm;
}

export interface SystemStatus {
  activeServers: number;
  requestsPerSecond: number;
  idsGenerated: number;
  duplicateIds: number;
  avgLatencyMs: number;
  peakThroughput: number;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export async function generateId(): Promise<GeneratedId> {
  const response = await fetch(`${API_BASE}/ids`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Backend unavailable");
  }

  // Read as text first so the 64-bit ID is NOT rounded by JavaScript.
  const raw = await response.text();

  const data = JSON.parse(raw);

  const idMatch = raw.match(/"id"\s*:\s*(\d+)/);

  if (!idMatch) {
    throw new Error("Invalid ID returned by backend");
  }

  const id = idMatch[1];

  // Decode the actual Snowflake ID.
  const decodeResponse = await fetch(
    `${API_BASE}/ids/${id}/decode`
  );

  if (!decodeResponse.ok) {
    throw new Error("Could not decode generated ID");
  }

  const decoded = await decodeResponse.json();

  return {
    id,
    workerId: Number(data.machineId),
    timestamp: Number(decoded.timestampMillis),
    sequence: Number(decoded.sequence),
    algorithm: "SNOWFLAKE",
  };
}

export async function getStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE}/stats`);

  if (!response.ok) {
    throw new Error("Backend unavailable");
  }

  const data = await response.json();

  return {
    activeServers: 3,
    requestsPerSecond: Number(data.requestsPerSecond),
    idsGenerated: Number(data.totalGenerated),
    duplicateIds: 0,
    avgLatencyMs: 0,
    peakThroughput: Number(data.requestsPerSecond),
  };
}
export async function generateBatch(
  count: number
): Promise<
  {
    id: string;
    machineId: number;
    datacenterId: number;
    timestampMillis: number;
    sequence: number;
  }[]
> {
  const response = await fetch(`${API_BASE}/ids/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count }),
  });

  if (!response.ok) {
    throw new Error("Batch generation failed");
  }

  // Read raw text so 64-bit Snowflake IDs stay exact.
  const raw = await response.text();

  const match = raw.match(/"ids"\s*:\s*\[([\s\S]*?)\]/);

  if (!match) {
    throw new Error("Invalid batch response");
  }

  const ids = [...match[1].matchAll(/\d+/g)].map((m) => m[0]);

  const decoded = await Promise.all(
    ids.map(async (id) => {
      const decodeResponse = await fetch(
        `${API_BASE}/ids/${id}/decode`
      );

      if (!decodeResponse.ok) {
        throw new Error(`Could not decode ID ${id}`);
      }

      const data = await decodeResponse.json();

      return {
        id,
        machineId: Number(data.machineId),
        datacenterId: Number(data.datacenterId),
        timestampMillis: Number(data.timestampMillis),
        sequence: Number(data.sequence),
      };
    })
  );

  return decoded;
}
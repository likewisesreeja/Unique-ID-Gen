package com.example.idgen.dto;

public class StatsResponse {
    private final long totalGenerated;
    private final long uptimeSeconds;
    private final double requestsPerSecond;
    private final long datacenterId;
    private final long machineId;
    private final String hostname;

    public StatsResponse(long totalGenerated, long uptimeSeconds, double requestsPerSecond,
                          long datacenterId, long machineId, String hostname) {
        this.totalGenerated = totalGenerated;
        this.uptimeSeconds = uptimeSeconds;
        this.requestsPerSecond = requestsPerSecond;
        this.datacenterId = datacenterId;
        this.machineId = machineId;
        this.hostname = hostname;
    }

    public long getTotalGenerated() {
        return totalGenerated;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public double getRequestsPerSecond() {
        return requestsPerSecond;
    }

    public long getDatacenterId() {
        return datacenterId;
    }

    public long getMachineId() {
        return machineId;
    }

    public String getHostname() {
        return hostname;
    }
}

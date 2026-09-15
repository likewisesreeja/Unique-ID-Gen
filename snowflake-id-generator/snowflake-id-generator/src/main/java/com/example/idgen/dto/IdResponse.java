package com.example.idgen.dto;

import java.time.Instant;

public class IdResponse {
    private final long id;
    private final long datacenterId;
    private final long machineId;
    private final String generatedAt;

    public IdResponse(long id, long datacenterId, long machineId) {
        this.id = id;
        this.datacenterId = datacenterId;
        this.machineId = machineId;
        this.generatedAt = Instant.now().toString();
    }

    public long getId() {
        return id;
    }

    public long getDatacenterId() {
        return datacenterId;
    }

    public long getMachineId() {
        return machineId;
    }

    public String getGeneratedAt() {
        return generatedAt;
    }
}

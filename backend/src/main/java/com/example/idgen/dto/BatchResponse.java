package com.example.idgen.dto;

import java.util.List;

public class BatchResponse {
    private final int count;
    private final long machineId;
    private final List<Long> ids;

    public BatchResponse(int count, long machineId, List<Long> ids) {
        this.count = count;
        this.machineId = machineId;
        this.ids = ids;
    }

    public int getCount() {
        return count;
    }

    public long getMachineId() {
        return machineId;
    }

    public List<Long> getIds() {
        return ids;
    }
}

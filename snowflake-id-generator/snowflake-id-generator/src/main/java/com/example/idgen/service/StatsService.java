package com.example.idgen.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class StatsService {

    private final AtomicLong totalGenerated = new AtomicLong(0);
    private final long startTimeMillis = System.currentTimeMillis();

    public void recordGenerated(long count) {
        totalGenerated.addAndGet(count);
    }

    public long getTotalGenerated() {
        return totalGenerated.get();
    }

    public long getUptimeSeconds() {
        return Math.max(1, (System.currentTimeMillis() - startTimeMillis) / 1000);
    }

    public double getRequestsPerSecond() {
        return getTotalGenerated() / (double) getUptimeSeconds();
    }
}

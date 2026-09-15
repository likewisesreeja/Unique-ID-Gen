package com.example.idgen.controller;

import com.example.idgen.dto.BatchRequest;
import com.example.idgen.dto.BatchResponse;
import com.example.idgen.dto.IdResponse;
import com.example.idgen.dto.StatsResponse;
import com.example.idgen.generator.SnowflakeIdGenerator;
import com.example.idgen.service.StatsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class IdController {

    private final SnowflakeIdGenerator generator;
    private final StatsService stats;

    public IdController(SnowflakeIdGenerator generator, StatsService stats) {
        this.generator = generator;
        this.stats = stats;
    }

    @PostMapping("/ids")
    public IdResponse generateOne() {
        long id = generator.nextId();
        stats.recordGenerated(1);
        return new IdResponse(id, generator.getDatacenterId(), generator.getMachineId());
    }

    @PostMapping("/ids/batch")
    public BatchResponse generateBatch(@Valid @RequestBody(required = false) BatchRequest request) {
        int count = request == null ? 1 : request.getCount();
        List<Long> ids = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            ids.add(generator.nextId());
        }
        stats.recordGenerated(count);
        return new BatchResponse(count, generator.getMachineId(), ids);
    }

    @GetMapping("/ids/{id}/decode")
    public Map<String, Object> decode(@PathVariable long id) {
        SnowflakeIdGenerator.DecodedId decoded = generator.decode(id);
        return Map.of(
                "id", id,
                "timestampMillis", decoded.timestampMillis(),
                "datacenterId", decoded.datacenterId(),
                "machineId", decoded.machineId(),
                "sequence", decoded.sequence()
        );
    }

    @GetMapping("/stats")
    public StatsResponse getStats() {
        String hostname = resolveHostname();
        return new StatsResponse(
                stats.getTotalGenerated(),
                stats.getUptimeSeconds(),
                stats.getRequestsPerSecond(),
                generator.getDatacenterId(),
                generator.getMachineId(),
                hostname
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "datacenterId", generator.getDatacenterId(),
                "machineId", generator.getMachineId(),
                "hostname", resolveHostname()
        );
    }

    private String resolveHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown";
        }
    }
}

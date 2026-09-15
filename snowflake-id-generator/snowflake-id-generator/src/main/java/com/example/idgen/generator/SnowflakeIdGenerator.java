package com.example.idgen.generator;

/**
 * Distributed unique ID generator based on Twitter's Snowflake algorithm.
 *
 * 64-bit layout (matches sign + 41 timestamp + 5 datacenter + 5 machine + 12 sequence):
 *
 *   1 bit   - unused sign bit (always 0, keeps the id a positive long)
 *   41 bits - milliseconds since a custom epoch (~69 years of range)
 *   5 bits  - datacenter id            (0-31)
 *   5 bits  - machine/worker id        (0-31)
 *   12 bits - per-millisecond sequence (0-4095, i.e. 4096 ids/ms per machine)
 *
 * Because the id is derived purely from local clock + fixed machine identity,
 * no coordination with other nodes or a database is required to generate an id.
 * This keeps the hot path extremely fast and removes the single point of failure
 * a central "next id" database or counter service would introduce.
 */
public class SnowflakeIdGenerator {

    /** Custom epoch: 2024-01-01T00:00:00Z, in milliseconds since Unix epoch. */
    public static final long DEFAULT_EPOCH = 1704067200000L;

    private static final long DATACENTER_ID_BITS = 5L;
    private static final long MACHINE_ID_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;

    public static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS); // 31
    public static final long MAX_MACHINE_ID = ~(-1L << MACHINE_ID_BITS);       // 31
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);          // 4095

    private static final long MACHINE_ID_SHIFT = SEQUENCE_BITS;
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS;
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS + DATACENTER_ID_BITS;

    /** Max allowed backwards clock jump (ms) we'll tolerate by waiting instead of failing. */
    private static final long MAX_BACKWARD_DRIFT_MS = 5L;

    private final long epoch;
    private final long datacenterId;
    private final long machineId;

    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public SnowflakeIdGenerator(long datacenterId, long machineId) {
        this(datacenterId, machineId, DEFAULT_EPOCH);
    }

    public SnowflakeIdGenerator(long datacenterId, long machineId, long epoch) {
        if (datacenterId < 0 || datacenterId > MAX_DATACENTER_ID) {
            throw new IllegalArgumentException(
                    "datacenterId must be between 0 and " + MAX_DATACENTER_ID + ", got " + datacenterId);
        }
        if (machineId < 0 || machineId > MAX_MACHINE_ID) {
            throw new IllegalArgumentException(
                    "machineId must be between 0 and " + MAX_MACHINE_ID + ", got " + machineId);
        }
        this.datacenterId = datacenterId;
        this.machineId = machineId;
        this.epoch = epoch;
    }

    /**
     * Generates the next unique id. Thread-safe: synchronized so concurrent
     * requests on the same node are serialized through the sequence counter.
     */
    public synchronized long nextId() {
        long timestamp = currentTimeMillis();

        if (timestamp < lastTimestamp) {
            long drift = lastTimestamp - timestamp;
            if (drift <= MAX_BACKWARD_DRIFT_MS) {
                // Small clock rollback (e.g. NTP correction) - wait it out.
                sleep(drift);
                timestamp = currentTimeMillis();
                if (timestamp < lastTimestamp) {
                    throw new ClockMovedBackwardsException(
                            "Clock moved backwards. Refusing to generate id for " + drift + "ms.");
                }
            } else {
                throw new ClockMovedBackwardsException(
                        "Clock moved backwards by " + drift + "ms, exceeding tolerance of "
                                + MAX_BACKWARD_DRIFT_MS + "ms.");
            }
        }

        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                // Sequence exhausted for this millisecond - spin until the clock ticks forward.
                timestamp = waitForNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - epoch) << TIMESTAMP_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (machineId << MACHINE_ID_SHIFT)
                | sequence;
    }

    public long getDatacenterId() {
        return datacenterId;
    }

    public long getMachineId() {
        return machineId;
    }

    private long waitForNextMillis(long lastTimestamp) {
        long timestamp = currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = currentTimeMillis();
        }
        return timestamp;
    }

    protected long currentTimeMillis() {
        return System.currentTimeMillis();
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /** Decomposes an id back into its component parts - handy for debugging/demos. */
    public DecodedId decode(long id) {
        long sequencePart = id & MAX_SEQUENCE;
        long machinePart = (id >> MACHINE_ID_SHIFT) & MAX_MACHINE_ID;
        long datacenterPart = (id >> DATACENTER_ID_SHIFT) & MAX_DATACENTER_ID;
        long timestampPart = (id >> TIMESTAMP_SHIFT) + epoch;
        return new DecodedId(timestampPart, datacenterPart, machinePart, sequencePart);
    }

    public record DecodedId(long timestampMillis, long datacenterId, long machineId, long sequence) {}

    public static class ClockMovedBackwardsException extends RuntimeException {
        public ClockMovedBackwardsException(String message) {
            super(message);
        }
    }
}

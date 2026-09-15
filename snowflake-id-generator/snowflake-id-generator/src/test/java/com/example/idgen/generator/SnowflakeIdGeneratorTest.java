package com.example.idgen.generator;

import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SnowflakeIdGeneratorTest {

    @Test
    void idsAreUniqueAndMonotonicForSingleThread() {
        SnowflakeIdGenerator gen = new SnowflakeIdGenerator(1, 1);
        long previous = -1;
        for (int i = 0; i < 100_000; i++) {
            long id = gen.nextId();
            assertTrue(id > previous, "ids should be strictly increasing");
            previous = id;
        }
    }

    @Test
    void idsAreUniqueUnderConcurrentLoadOnOneNode() throws InterruptedException {
        SnowflakeIdGenerator gen = new SnowflakeIdGenerator(1, 1);
        int threadCount = 50;
        int idsPerThread = 2000;
        Set<Long> ids = ConcurrentHashMap.newKeySet();
        ExecutorService pool = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int t = 0; t < threadCount; t++) {
            pool.submit(() -> {
                try {
                    for (int i = 0; i < idsPerThread; i++) {
                        ids.add(gen.nextId());
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(30, TimeUnit.SECONDS));
        pool.shutdown();

        assertEquals(threadCount * idsPerThread, ids.size(), "no duplicate ids should be generated");
    }

    @Test
    void differentMachineIdsNeverCollideEvenWithSameSequence() {
        SnowflakeIdGenerator server1 = new SnowflakeIdGenerator(1, 1);
        SnowflakeIdGenerator server2 = new SnowflakeIdGenerator(1, 2);
        SnowflakeIdGenerator server3 = new SnowflakeIdGenerator(1, 3);

        long id1 = server1.nextId();
        long id2 = server2.nextId();
        long id3 = server3.nextId();

        assertTrue(id1 != id2 && id2 != id3 && id1 != id3);
    }

    @Test
    void decodeRecoversMachineAndDatacenterId() {
        SnowflakeIdGenerator gen = new SnowflakeIdGenerator(2, 7);
        long id = gen.nextId();
        SnowflakeIdGenerator.DecodedId decoded = gen.decode(id);
        assertEquals(2, decoded.datacenterId());
        assertEquals(7, decoded.machineId());
    }

    @Test
    void rejectsOutOfRangeMachineId() {
        try {
            new SnowflakeIdGenerator(1, 999);
            assertTrue(false, "should have thrown");
        } catch (IllegalArgumentException expected) {
            // expected
        }
    }
}

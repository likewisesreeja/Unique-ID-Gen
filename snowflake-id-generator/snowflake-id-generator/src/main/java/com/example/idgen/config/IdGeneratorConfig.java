package com.example.idgen.config;

import com.example.idgen.generator.SnowflakeIdGenerator;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "id-generator")
public class IdGeneratorConfig {

    /**
     * Datacenter and machine id MUST be unique per running instance and MUST stay
     * stable across restarts of that instance. In docker-compose each id-server
     * container is given its own fixed values via environment variables - see
     * docker-compose.yml. Randomly assigning these on every startup (e.g. for
     * dynamically scaled replicas) risks two nodes colliding and producing
     * duplicate ids, which is why this project pins them explicitly per node.
     */
    private long datacenterId = 1;
    private long machineId = 1;

    public long getDatacenterId() {
        return datacenterId;
    }

    public void setDatacenterId(long datacenterId) {
        this.datacenterId = datacenterId;
    }

    public long getMachineId() {
        return machineId;
    }

    public void setMachineId(long machineId) {
        this.machineId = machineId;
    }

    @Bean
    public SnowflakeIdGenerator snowflakeIdGenerator() {
        return new SnowflakeIdGenerator(datacenterId, machineId);
    }
}

# Snowflake ID Generator — Distributed Systems Project

A horizontally scalable, distributed unique-ID generator built around the
**Snowflake algorithm**. Three independent Spring Boot worker nodes generate
64-bit ids locally (no shared database, no central counter), sit behind an
NGINX load balancer, and stay collision-free by construction.

```
sign(1) + timestamp(41) + datacenter(5) + machine(5) + sequence(12) = 64 bits
```

## Architecture

```
                 1M users
                    │
                    ▼
              NGINX (:8080)
                    │
      ┌─────────────┼─────────────┐
      ▼              ▼              ▼
 id-server-1    id-server-2    id-server-3
 dc=1, m=1      dc=1, m=2      dc=1, m=3
      │              │              │
      └──────────────┴──────────────┘
             unique 64-bit ids
```

Each node generates ids from its own clock + fixed (datacenter, machine)
identity — no coordination needed per request, which is what keeps the hot
path fast and removes any single point of failure. See
`src/.../generator/SnowflakeIdGenerator.java` for the algorithm itself.

## Project layout

```
snowflake-id-generator/
├── src/main/java/com/example/idgen/
│   ├── generator/SnowflakeIdGenerator.java   # the algorithm
│   ├── config/IdGeneratorConfig.java         # reads DATACENTER_ID / MACHINE_ID
│   ├── controller/IdController.java          # REST API
│   ├── service/StatsService.java             # counters for /stats
│   └── dto/                                  # request/response shapes
├── src/test/java/.../SnowflakeIdGeneratorTest.java  # uniqueness + concurrency tests
├── frontend/index.html            # live monitoring dashboard (served by NGINX)
├── nginx/nginx.conf               # 3-node load balancer config
├── nginx/nginx.scale.conf         # 5-node variant, used for the scaling demo
├── docker-compose.yml             # 3 worker nodes + NGINX
├── docker-compose.scale.yml       # adds 2 more nodes for Demo 5
├── Dockerfile                     # multi-stage build for one worker node
├── scripts/concurrency_test.py    # fires parallel requests, checks for dupes
└── scripts/failure_demo.sh        # kills a node, proves the cluster survives
```

## Running it

Requires Docker and Docker Compose.

```bash
cd snowflake-id-generator
docker compose up --build
```

This builds and starts 3 worker nodes and NGINX on **http://localhost:8080**.

- Dashboard: `http://localhost:8080/`
- API: `http://localhost:8080/api/v1/...`

## API

| Method | Path                    | Description                          |
|--------|-------------------------|---------------------------------------|
| POST   | `/api/v1/ids`           | Generate a single id                  |
| POST   | `/api/v1/ids/batch`     | Generate N ids — body `{"count": 100}` |
| GET    | `/api/v1/ids/{id}/decode` | Decode an id back into its parts    |
| GET    | `/api/v1/stats`         | Per-node counters (which node answers depends on round-robin) |
| GET    | `/api/v1/health`        | Health check, reports datacenter/machine id |

Example:

```bash
curl -X POST http://localhost:8080/api/v1/ids
# {"id":7291834017234944,"datacenterId":1,"machineId":2,"generatedAt":"..."}

curl -X POST http://localhost:8080/api/v1/ids/batch \
  -H "Content-Type: application/json" -d '{"count": 100}'
```

## Running the 5 demos from the project plan

**Demo 1 — single server, single id**
```bash
curl -X POST http://localhost:8080/api/v1/ids
```

**Demo 2 — request hits different Docker servers**
```bash
for i in $(seq 1 10); do curl -s -X POST http://localhost:8080/api/v1/ids | python3 -m json.tool; done
```
Watch the `machineId` field rotate as NGINX round-robins across nodes.

**Demo 3 — concurrent generation, no duplicates**
```bash
pip install --break-system-packages -r /dev/null 2>/dev/null || true  # no deps needed, stdlib only
python3 scripts/concurrency_test.py --url http://localhost:8080 --total 100000 --workers 50
```
Prints generated / unique / duplicate counts and throughput.

**Demo 4 — kill a node, cluster keeps working**
```bash
bash scripts/failure_demo.sh http://localhost:8080
```

**Demo 5 — scale from 3 to 5 nodes**
```bash
docker compose -f docker-compose.yml -f docker-compose.scale.yml up --build
python3 scripts/concurrency_test.py --url http://localhost:8080 --total 50000 --workers 50
```
See the comment in `docker-compose.scale.yml` for why nodes are added
explicitly (with pinned machine ids) rather than via `--scale`: every node
needs a stable, unique machine id, and Compose has no built-in way to
allocate that safely for auto-scaled replicas.

## Design notes

- **No database or Redis on the id-generation hot path.** Each node computes
  ids from local clock + fixed identity, so there's nothing to query or
  contend on. Redis/a DB could still be layered in for rate limiting or
  analytics without affecting id generation itself.
- **Throughput headroom.** 12 sequence bits give 4,096 ids/ms per node, i.e.
  ~4.1M ids/sec per node in theory — the real bottleneck for 1M users is
  network/request volume, not the algorithm.
- **Clock safety.** The generator tolerates small backwards clock jumps (≤5ms,
  e.g. an NTP correction) by briefly waiting; a larger rollback throws rather
  than risk generating a duplicate/lower id.
- **Fixed machine ids.** Datacenter/machine id must stay stable per node
  across restarts — assigned via `DATACENTER_ID`/`MACHINE_ID` env vars in
  Compose, not derived randomly at boot.

## Tests

```bash
./mvnw test
```

Covers: strict monotonicity single-threaded, uniqueness under 50-thread
concurrent load on one node, no collisions across different machine ids, and
id decoding.

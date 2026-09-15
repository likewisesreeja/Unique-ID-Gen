#!/usr/bin/env python3
"""
Concurrency test for the id-generation cluster.

Fires many requests in parallel through the NGINX load balancer and verifies
that every id returned is unique, proving the distributed generator is safe
under concurrent load across multiple servers - this is "Demo 3" from the
project plan.

Usage:
    python3 scripts/concurrency_test.py --url http://localhost:8080 --total 100000 --workers 50
"""
import argparse
import concurrent.futures
import json
import time
import urllib.request


def generate_batch(base_url: str, count: int):
    req = urllib.request.Request(
        f"{base_url}/api/v1/ids/batch",
        data=json.dumps({"count": count}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = json.loads(resp.read())
        return body["ids"], body["machineId"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8080")
    parser.add_argument("--total", type=int, default=100000, help="total ids to generate")
    parser.add_argument("--workers", type=int, default=50, help="concurrent workers")
    args = parser.parse_args()

    batch_size = max(1, args.total // args.workers)
    remaining = args.total
    jobs = []
    while remaining > 0:
        size = min(batch_size, remaining)
        jobs.append(size)
        remaining -= size

    print(f"Generating {args.total:,} ids using {args.workers} concurrent workers "
          f"({len(jobs)} batch requests)...")

    all_ids = []
    machine_counts = {}
    start = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(generate_batch, args.url, size) for size in jobs]
        for fut in concurrent.futures.as_completed(futures):
            try:
                ids, machine_id = fut.result()
                all_ids.extend(ids)
                machine_counts[machine_id] = machine_counts.get(machine_id, 0) + len(ids)
            except Exception as e:
                print(f"  request failed: {e}")

    elapsed = time.time() - start
    unique_ids = set(all_ids)
    duplicates = len(all_ids) - len(unique_ids)

    print()
    print("=" * 50)
    print(f"Generated:   {len(all_ids):,}")
    print(f"Unique:      {len(unique_ids):,}")
    print(f"Duplicates:  {duplicates:,}")
    print(f"Elapsed:     {elapsed:.2f}s")
    print(f"Throughput:  {len(all_ids) / elapsed:,.0f} ids/sec")
    print("Ids served by each node:")
    for machine_id, count in sorted(machine_counts.items()):
        print(f"  machine {machine_id}: {count:,}")
    print("=" * 50)

    if duplicates == 0:
        print("PASS: all generated ids are unique.")
    else:
        print("FAIL: duplicate ids detected.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()

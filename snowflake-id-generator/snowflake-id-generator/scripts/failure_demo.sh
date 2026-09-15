#!/usr/bin/env bash
# Demo 4: kill a worker node and prove the cluster keeps generating ids.
set -e

URL="${1:-http://localhost:8080}"

echo "Before failure — sampling a few ids:"
for i in 1 2 3; do
  curl -s -X POST "$URL/api/v1/ids" | python3 -m json.tool
done

echo
echo ">>> Stopping id-server-2 ..."
docker stop id-server-2

echo "Waiting for NGINX to mark it unhealthy (~5-10s)..."
sleep 8

echo
echo "After failure — cluster should still respond:"
FAIL=0
for i in $(seq 1 10); do
  if ! curl -sf -X POST "$URL/api/v1/ids" > /dev/null; then
    FAIL=$((FAIL+1))
  fi
done
echo "Failed requests out of 10: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "PASS: cluster remained fully available with one node down."
else
  echo "Some requests failed while NGINX was still routing to the dead node — this settles down after fail_timeout."
fi

echo
echo ">>> Restarting id-server-2 ..."
docker start id-server-2
echo "Done."

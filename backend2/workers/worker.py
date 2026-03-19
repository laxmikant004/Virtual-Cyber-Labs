import redis
import sys
import json
import os
import subprocess
import time
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("REDIS_DB")),
    decode_responses=True
)

QUEUE = os.getenv("QUEUE_NAME", "network-queue")

SCRIPT = "/home/laxmikant/Virtual-Cyber-Labs/backend2/scripts/create_user_bridges.py"
PYTHON = "/home/laxmikant/Virtual-Cyber-Labs/backend2/venv/bin/python3"


def process(user_id):
    print(f"[+] Creating network for user {user_id}", flush=True)

    subprocess.run(
        ["sudo", PYTHON, SCRIPT, str(user_id)],
        check=True
    )

    print(f"[✓] Done user {user_id}", flush=True)


def start_worker():
    print("[WORKER] Started...", flush=True)

    while True:
        try:
            _, job = r.brpop(QUEUE)
            data = json.loads(job)

            user_id = data.get("user_id")

            if not user_id:
                print("[SKIP] Invalid job:", data, flush=True)
                continue

            print(f"[JOB] Processing user {user_id}", flush=True)

            process(user_id)

        except Exception as e:
            print("[ERROR]", e, flush=True)
            time.sleep(2)


if __name__ == "__main__":
    start_worker()
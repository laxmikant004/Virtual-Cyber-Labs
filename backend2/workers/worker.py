import redis
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

QUEUE = os.getenv("QUEUE_NAME", "network_queue")

SCRIPT = "/home/laxmikant/Virtual-Cyber-Labs/backend2/scripts/create_user_bridges.py"
PYTHON = "/home/laxmikant/Virtual-Cyber-Labs/backend2/venv/bin/python"


def acquire_lock(user_id):
    return r.set(f"network:lock:{user_id}", "1", nx=True, ex=300)


def release_lock(user_id):
    r.delete(f"network:lock:{user_id}")


def process(user_id):
    print(f"[+] Creating network for user {user_id}")

    subprocess.run(
        ["sudo", PYTHON, SCRIPT, str(user_id)],
        check=True
    )

    print(f"[✓] Done user {user_id}")


def start_worker():
    print("[WORKER] Started...")

    while True:
        try:
            _, job = r.brpop(QUEUE)
            data = json.loads(job)

            user_id = data["user_id"]

            if not acquire_lock(user_id):
                print(f"[SKIP] User {user_id} already running")
                continue

            try:
                process(user_id)
            finally:
                release_lock(user_id)

        except Exception as e:
            print("[ERROR]", e)
            time.sleep(2)


if __name__ == "__main__":
    start_worker()

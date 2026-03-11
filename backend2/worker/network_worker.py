#!/usr/bin/env python3

import sys
import os
sys.path.append("..")
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
import subprocess
from config.redis_client import redis_client

QUEUE_NAME = "network_queue"

print("🚀 Network worker started and waiting for jobs...")

while True:

    job = redis_client.blpop(QUEUE_NAME)

    if job is None:
        continue

    queue_name = job[0]
    payload = job[1]

    data = json.loads(payload)

    user_id = data["user_id"]

    print(f"[+] Creating network for user {user_id}")

    try:

        subprocess.run(
            [
                "sudo",
                "python3",
                "/scripts/create_user_bridges.py",
                str(user_id)
            ],
            check=True
        )

        print(f"[✔] Network created for user {user_id}")

    except Exception as e:

        print(f"[✖] Failed to create network for user {user_id}: {e}")
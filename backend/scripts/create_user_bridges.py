#!/usr/bin/env python3

import os
import sys
import subprocess
import re
import shutil
import yaml
import psycopg2
from dotenv import load_dotenv
import json
import datetime

# ✅ Load env
load_dotenv("/home/laxmikant/Virtual-Cyber-Labs/backend/.env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

NETPLAN_DIR = "/etc/netplan"
DNSMASQ_DIR = "/etc/dnsmasq.d"
DNSMASQ_TEMPLATE_SERVICE = "/etc/systemd/system/dnsmasq@.service"

# ------------------- LOGS -------------------
def log(level, message, **kwargs):
    entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        **kwargs
    }
    print(json.dumps(entry))
# ------------------- UTILS -------------------

def run_command(cmd):
    print(f"[+] Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)


def calculate_subnet(bridge_number):
    X = (bridge_number // 256) % 256
    Y = bridge_number % 256
    return f"10.{X}.{Y}"


# ------------------- DB FUNCTIONS -------------------

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


def user_network_exists(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT bridge_name FROM tbl_networks WHERE user_id=%s AND is_active=TRUE",
        (user_id,)
    )

    result = cursor.fetchone()
    conn.close()

    if result:
        print(f"[✔] User already has bridge: {result[0]}")
        return True

    return False


def get_next_bridge_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT bridge_name FROM tbl_networks")
    rows = cursor.fetchall()
    conn.close()

    used_numbers = set()

    for (bridge,) in rows:
        match = re.match(r'br(\d+)', bridge)
        if match:
            used_numbers.add(int(match.group(1)))

    bridge_number = 0
    while bridge_number in used_numbers:
        bridge_number += 1

    subnet = calculate_subnet(bridge_number)
    return bridge_number, subnet


def insert_network(user_id, bridge, subnet):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO tbl_networks (
            user_id, bridge_name, net_gateway, net_subnet,
            dc_net_name, lxd_net_name, dns_mask, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
    """, (
        user_id,
        bridge,
        f"{subnet}.1",
        f"{subnet}.0/24",
        f"docker_net_{bridge}",
        f"lxc_profile_{bridge}",
        f"dnsmasq@{bridge}"
    ))

    conn.commit()
    conn.close()
    log("INFO", "DB insert success", user_id=user_id, bridge=bridge)

# ------------------- SYSTEM FUNCTIONS -------------------

def write_netplan_yaml(bridge, subnet):
    yaml_path = os.path.join(NETPLAN_DIR, f"{bridge}_bridges.yaml")

    if os.path.exists(yaml_path):
        print(f"[!] Netplan already exists for {bridge}")
        return

    data = {
        "network": {
            "version": 2,
            "renderer": "networkd",
            "bridges": {
                bridge: {
                    "interfaces": [],
                    "addresses": [f"{subnet}.1/24"],
                    "dhcp4": False,
                    "parameters": {"stp": False, "forward-delay": 0}
                }
            }
        }
    }

    with open(yaml_path, "w") as f:
        yaml.dump(data, f)

    print(f"[+] Netplan created for {bridge}")


def create_dnsmasq_config(bridge, subnet):
    path = f"{DNSMASQ_DIR}/{bridge}.conf"

    if os.path.exists(path):
        print(f"[!] DNSMASQ already exists for {bridge}")
        return

    config = f"""
domain-needed
bogus-priv
dhcp-range={subnet}.10,{subnet}.100,12h
dhcp-option=3,{subnet}.1
dhcp-option=6,8.8.8.8,1.1.1.1
"""

    with open(path, "w") as f:
        f.write(config)

    print(f"[+] DNSMASQ config created")


def enable_nat(subnet):
    ext_iface = subprocess.getoutput(
        "ip route | grep default | awk '{print $5}'"
    ).strip()

    # Prevent duplicate NAT rule
    check = subprocess.getoutput(
        f"iptables -t nat -C POSTROUTING -s {subnet}.0/24 -o {ext_iface} -j MASQUERADE 2>/dev/null || echo 'notfound'"
    )

    if "notfound" in check:
        run_command(
            f"iptables -t nat -A POSTROUTING -s {subnet}.0/24 -o {ext_iface} -j MASQUERADE"
        )

    run_command("netfilter-persistent save")


def create_lxd_profile(bridge):
    profile_name = f"lxc_profile_{bridge}"

    existing = subprocess.getoutput("lxc profile list")
    if profile_name in existing:
        print(f"[!] LXD profile already exists")
        return

    print(f"[+] Creating LXD profile: {profile_name}")

    # Create profile
    run_command(f"lxc profile create {profile_name}")

    # Full profile config (IMPORTANT)
    profile_yaml = f"""
config: {{}}
description: Bridged profile on {bridge}
devices:
  eth0:
    name: eth0
    nictype: bridged
    parent: {bridge}
    type: nic
  root:
    path: /
    pool: default
    type: disk
name: {profile_name}
"""

    tmp_path = "/tmp/profile.yaml"

    with open(tmp_path, "w") as f:
        f.write(profile_yaml)

    # Apply config
    run_command(f"lxc profile edit {profile_name} < {tmp_path}")

    os.remove(tmp_path)

    print(f"[+] LXD profile configured for {bridge}")


def create_docker_bridge(bridge, subnet):
    docker_net = f"docker_net_{bridge}"

    existing = subprocess.getoutput("docker network ls --format '{{.Name}}'")
    if docker_net in existing:
        print(f"[!] Docker network already exists")
        return

    print(f"[+] Creating Docker network: {docker_net}")

    run_command(
        f"docker network create "
        f"--driver=bridge "
        f"--subnet={subnet}.0/24 "
        f"--gateway={subnet}.1 "
        f"--opt com.docker.network.bridge.name={bridge} "
        f"{docker_net}"
    )

    print(f"[+] Docker network bound to {bridge}")


# ------------------- MAIN -------------------

def main():
    if os.geteuid() != 0:
        print("[-] Run as root")
        sys.exit(1)

    if len(sys.argv) != 2:
        print("Usage: script.py <user_id>")
        sys.exit(1)

    user_id = int(sys.argv[1])

    if user_network_exists(user_id):
        print("[SKIP] Already exists")
        return

    bridge_number, subnet = get_next_bridge_from_db()
    bridge = f"br{bridge_number}"

    log("INFO", "Allocating bridge", bridge=bridge, subnet=f"{subnet}.0/24")

    # ✅ Insert FIRST (DB is source of truth)
    insert_network(user_id, bridge, subnet)

    # ✅ Then apply system
    write_netplan_yaml(bridge, subnet)
    create_dnsmasq_config(bridge, subnet)
    enable_nat(subnet)
    create_lxd_profile(bridge)
    create_docker_bridge(bridge, subnet)

    run_command("netplan apply")
    run_command(f"systemctl enable --now dnsmasq@{bridge}")

    print(f"✅ Done for user {user_id}")


if __name__ == "__main__":
    main()
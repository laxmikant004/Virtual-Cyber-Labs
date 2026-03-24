#!/usr/bin/env python3

import os
import sys
import subprocess
import re
import psycopg2
from dotenv import load_dotenv

# ✅ Load env
load_dotenv("/home/laxmikant/Virtual-Cyber-Labs/backend/.env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

NETPLAN_DIR = "/etc/netplan"
DNSMASQ_DIR = "/etc/dnsmasq.d"


# ------------------- UTILS -------------------

def run(cmd):
    print(f"[+] Running: {cmd}")
    subprocess.run(cmd, shell=True, check=False)


def validate_bridge(bridge):
    if not re.match(r'^br\d+$', bridge):
        print("[-] Invalid bridge name (expected brX)")
        sys.exit(1)


# ------------------- DB -------------------

def deactivate_db_entry(bridge):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        cursor = conn.cursor()

        cursor.execute("""
            UPDATE tbl_networks
            SET is_active = FALSE
            WHERE bridge_name = %s
        """, (bridge,))

        conn.commit()
        conn.close()

        print(f"[DB] Marked {bridge} as inactive")

    except Exception as e:
        print(f"[DB ERROR] {e}")


# ------------------- CONTAINER CLEANUP -------------------

def cleanup_lxd_containers(bridge):
    print(f"[+] Checking LXD containers on {bridge}")

    containers = subprocess.getoutput("lxc list --format csv -c n").splitlines()

    for c in containers:
        config = subprocess.getoutput(f"lxc config show {c}")
        if f"parent: {bridge}" in config:
            print(f"[!] Stopping LXD container: {c}")
            run(f"lxc stop {c} --force")
            run(f"lxc delete {c}")


def cleanup_docker_containers(bridge):
    print(f"[+] Checking Docker containers on {bridge}")

    containers = subprocess.getoutput(
        "docker ps -a --format '{{.ID}} {{.Names}}'"
    ).splitlines()

    for line in containers:
        parts = line.split()
        if len(parts) < 2:
            continue

        cid = parts[0]

        net = subprocess.getoutput(
            f"docker inspect -f '{{{{.HostConfig.NetworkMode}}}}' {cid}"
        )

        if f"docker_net_{bridge}" in net:
            print(f"[!] Removing Docker container: {cid}")
            run(f"docker rm -f {cid}")


# ------------------- DELETE FUNCTIONS -------------------

def stop_dnsmasq_service(bridge):
    service = f"dnsmasq@{bridge}"
    run(f"systemctl disable --now {service}")

    symlink = f"/etc/systemd/system/multi-user.target.wants/{service}.service"
    if os.path.exists(symlink):
        os.remove(symlink)
        print(f"[+] Removed systemd symlink: {symlink}")


def delete_dnsmasq_config(bridge):
    path = os.path.join(DNSMASQ_DIR, f"{bridge}.conf")
    if os.path.exists(path):
        os.remove(path)
        print(f"[+] Deleted dnsmasq config: {path}")


def delete_netplan(bridge):
    path = os.path.join(NETPLAN_DIR, f"{bridge}_bridges.yaml")
    if os.path.exists(path):
        os.remove(path)
        print(f"[+] Deleted netplan config: {path}")


def delete_docker_network(bridge):
    name = f"docker_net_{bridge}"

    existing = subprocess.getoutput("docker network ls --format '{{.Name}}'")
    if name in existing:
        run(f"docker network rm {name}")
        print(f"[+] Deleted Docker network: {name}")


def delete_lxd_profile(bridge):
    name = f"lxc_profile_{bridge}"

    profiles = subprocess.getoutput("lxc profile list")
    if name in profiles:
        run(f"lxc profile delete {name}")
        print(f"[+] Deleted LXD profile: {name}")


def cleanup_iptables(subnet):
    print(f"[+] Cleaning iptables for {subnet}.0/24")

    ext_iface = subprocess.getoutput(
        "ip route | grep default | awk '{print $5}'"
    ).strip()

    run(
        f"iptables -t nat -D POSTROUTING -s {subnet}.0/24 -o {ext_iface} -j MASQUERADE"
    )

    run("netfilter-persistent save")


def delete_bridge_interface(bridge):
    result = subprocess.getoutput("ip link show")

    if f"{bridge}:" in result:
        run(f"ip link set {bridge} down")
        run(f"ip link delete {bridge} type bridge")
        print(f"[+] Deleted bridge interface: {bridge}")


# ------------------- MAIN -------------------

def main():
    if os.geteuid() != 0:
        print("[-] Run as root")
        sys.exit(1)

    if len(sys.argv) != 2:
        print("Usage: sudo python3 delete_bridge.py brX")
        sys.exit(1)

    bridge = sys.argv[1]
    validate_bridge(bridge)

    print(f"\n🔥 Deleting {bridge}...\n")

    # Detect subnet from dnsmasq
    subnet = None
    conf = os.path.join(DNSMASQ_DIR, f"{bridge}.conf")

    if os.path.exists(conf):
        with open(conf) as f:
            for line in f:
                m = re.search(r'dhcp-range=(10\.\d+\.\d+)\.\d+', line)
                if m:
                    subnet = m.group(1)
                    break

    # 🔥 Correct deletion order
    stop_dnsmasq_service(bridge)

    cleanup_lxd_containers(bridge)
    cleanup_docker_containers(bridge)

    delete_docker_network(bridge)
    delete_lxd_profile(bridge)

    if subnet:
        cleanup_iptables(subnet)

    delete_dnsmasq_config(bridge)
    delete_netplan(bridge)
    delete_bridge_interface(bridge)

    run("netplan apply")

    # ✅ DB update instead of delete
    deactivate_db_entry(bridge)

    print(f"\n✅ {bridge} deleted and marked inactive in DB\n")


if __name__ == "__main__":
    main()
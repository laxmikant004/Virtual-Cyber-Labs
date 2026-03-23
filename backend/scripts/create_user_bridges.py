#!/usr/bin/env python3

import os
import sys
import subprocess
import re
import shutil
import yaml
import psycopg2
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

NETPLAN_DIR = "/etc/netplan"
DNSMASQ_DIR = "/etc/dnsmasq.d"
DNSMASQ_TEMPLATE_SERVICE = "/etc/systemd/system/dnsmasq@.service"

def run_command(cmd):
    print(f"[+] Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def get_used_bridge_numbers():
    used = set()
    for fname in os.listdir(NETPLAN_DIR):
        if re.match(r'br\d+_bridges\.yaml$', fname):
            match = re.search(r'br(\d+)', fname)
            if match:
                used.add(int(match.group(1)))
    result = subprocess.getoutput("ip link show")
    for line in result.splitlines():
        match = re.search(r'br(\d+):', line)
        if match:
            used.add(int(match.group(1)))
    for fname in os.listdir(DNSMASQ_DIR):
        match = re.match(r'br(\d+)\.conf$', fname)
        if match:
            used.add(int(match.group(1)))
    return used

def detect_used_subnets():
    subnets = set()
    result = subprocess.getoutput("ip -4 addr show")
    for line in result.splitlines():
        match = re.search(r'inet\s+(10\.\d+\.\d+)\.\d+/\d+', line)
        if match:
            subnets.add(match.group(1))
    for fname in os.listdir(DNSMASQ_DIR):
        path = os.path.join(DNSMASQ_DIR, fname)
        with open(path) as f:
            for line in f:
                match = re.search(r'dhcp-range=(10\.\d+\.\d+)\.\d+', line)
                if match:
                    subnets.add(match.group(1))
    for fname in os.listdir(NETPLAN_DIR):
        if fname.endswith("_bridges.yaml"):
            with open(os.path.join(NETPLAN_DIR, fname)) as f:
                try:
                    data = yaml.safe_load(f)
                    bridges = data.get("network", {}).get("bridges", {})
                    for b in bridges.values():
                        for addr in b.get("addresses", []):
                            match = re.match(r"(10\.\d+\.\d+)\.\d+/\d+", addr)
                            if match:
                                subnets.add(match.group(1))
                except Exception:
                    continue
    return subnets

def calculate_subnet(bridge_number):
    X = (bridge_number // 256) % 256
    Y = bridge_number % 256
    return f"10.{X}.{Y}"

def get_next_bridge_number(used_bridges, used_subnets):
    bridge_number = 0
    while True:
        subnet = calculate_subnet(bridge_number)
        if bridge_number not in used_bridges and subnet not in used_subnets:
            return bridge_number, subnet
        bridge_number += 1

def write_netplan_yaml(bridge, subnet):
    yaml_path = os.path.join(NETPLAN_DIR, f"{bridge}_bridges.yaml")
    if os.path.exists(yaml_path):
        print(f"[!] Skipping {bridge} - netplan YAML exists.")
        return False
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
    print(f"[+] Wrote netplan config: {yaml_path}")
    return True

def create_dnsmasq_config(bridge, subnet):
    path = f"{DNSMASQ_DIR}/{bridge}.conf"
    if os.path.exists(path):
        print(f"[!] Skipping {bridge} - dnsmasq config exists.")
        return False
    config = f"""domain-needed
bogus-priv
dhcp-range={subnet}.10,{subnet}.100,12h
dhcp-option=3,{subnet}.1
dhcp-option=6,8.8.8.8,1.1.1.1
"""
    with open(path, "w") as f:
        f.write(config)
    print(f"[+] Created DHCP config: {path}")
    return True

def enable_nat(bridge, subnet):
    print(f"[+] Enabling NAT and isolation for {bridge} ({subnet}.0/24)")

    run_command("sysctl -w net.ipv4.ip_forward=1")
    with open("/etc/sysctl.conf", "r+") as f:
        content = f.read()
        if "net.ipv4.ip_forward=1" not in content:
            f.write("\nnet.ipv4.ip_forward=1\n")

    ext_iface = subprocess.getoutput("ip route | grep default | awk '{print $5}'").strip()
    if not ext_iface:
        print("[-] Could not detect default interface.")
        sys.exit(1)

    run_command(f"iptables -I FORWARD -s {subnet}.0/24 -d {subnet}.1 -j ACCEPT")
    run_command(f"iptables -I FORWARD -s {subnet}.1 -d {subnet}.0/24 -j ACCEPT")
    run_command(f"iptables -I FORWARD -s {subnet}.0/24 -o {ext_iface} -j ACCEPT")
    run_command(f"iptables -I FORWARD -i {ext_iface} -d {subnet}.0/24 -m state --state ESTABLISHED,RELATED -j ACCEPT")
    run_command(f"iptables -I FORWARD -s {subnet}.0/24 -d 10.0.0.0/8 -j DROP")
    run_command(f"iptables -I FORWARD -s 10.0.0.0/8 -d {subnet}.0/24 -j DROP")
    run_command(f"iptables -I FORWARD -s {subnet}.0/24 -d 10.0.0.0/8 -p icmp -j DROP")
    run_command(f"iptables -I FORWARD -s 10.0.0.0/8 -d {subnet}.0/24 -p icmp -j DROP")
    run_command(f"iptables -t nat -A POSTROUTING -s {subnet}.0/24 -o {ext_iface} -j MASQUERADE")
    run_command("netfilter-persistent save")

def create_lxd_profile(bridge):
    profile_name = f"lxc_profile_{bridge}"
    print(f"[+] Creating LXD profile: {profile_name}")
    run_command(f"lxc profile create {profile_name}")
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
    run_command(f"lxc profile edit {profile_name} < {tmp_path}")
    os.remove(tmp_path)

def create_docker_bridge(bridge, subnet):
    docker_net_name = f"docker_net_{bridge}"
    print(f"[+] Creating Docker network: {docker_net_name}")
    run_command(
        f"docker network create "
        f"--driver=bridge "
        f"--subnet={subnet}.0/24 "
        f"--gateway={subnet}.1 "
        f"--opt com.docker.network.bridge.name={bridge} "
        f"{docker_net_name}"
    )

def check_environment():
    print("[*] Checking environment...")
    for cmd in ["python3", "ip", "netplan", "systemctl", "dnsmasq", "lxc", "docker"]:
        if shutil.which(cmd) is None:
            print(f"[-] Missing command: {cmd}")
            sys.exit(1)
    if not os.path.isdir(DNSMASQ_DIR):
        os.makedirs(DNSMASQ_DIR)
    if not os.path.exists(DNSMASQ_TEMPLATE_SERVICE):
        print(f"[-] Missing systemd template: {DNSMASQ_TEMPLATE_SERVICE}")
        sys.exit(1)

def main():
    if os.geteuid() != 0:
        print("[-] Run this script as root.")
        sys.exit(1)

    if len(sys.argv) != 2:
        print("Usage: sudo ./create_user_bridges2.py <user_id>")
        sys.exit(1)

    user_id = int(sys.argv[1])

    check_environment()
    used_bridges = get_used_bridge_numbers()
    used_subnets = detect_used_subnets()

    bridge_number, subnet = get_next_bridge_number(used_bridges, used_subnets)
    bridge = f"br{bridge_number}"

    print(f"\n[🔧] Creating {bridge} for user {user_id} with subnet {subnet}.0/24")

    if write_netplan_yaml(bridge, subnet) and create_dnsmasq_config(bridge, subnet):
        enable_nat(bridge, subnet)
        create_lxd_profile(bridge)
        create_docker_bridge(bridge, subnet)

        run_command("netplan apply")
        run_command("systemctl daemon-reexec")
        run_command("systemctl daemon-reload")
        run_command(f"systemctl enable --now dnsmasq@{bridge}")
    else:
        print(f"[!] Skipping config for {bridge} - already exists.")

    # ✅ PostgreSQL Insert using .env
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
            INSERT INTO tbl_networks (
                user_id, bridge_name, net_gateway, net_subnet,
                dc_net_name, lxd_net_name, dns_mask, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
        """, (
            user_id, bridge, f"{subnet}.1", f"{subnet}.0/24",
            f"docker_net_{bridge}", f"lxc_profile_{bridge}", f"dnsmasq@{bridge}"
        ))

        conn.commit()
        conn.close()

        print(f"[DB] Network details inserted for user: {user_id}")

    except Exception as e:
        print(f"[DB] Failed to log network for user {user_id}: {e}")

    print(f"\n✅ {bridge} created for user {user_id}")

if __name__ == "__main__":
    main()

# 🖥️ VPS Setup Guide - Persiapan Server Ubuntu 22.04

Panduan lengkap setup VPS dari awal sebelum deployment aplikasi RPS.

---

## 📋 Daftar Isi

1. [Initial Server Setup](#1-initial-server-setup)
2. [Security Hardening](#2-security-hardening)
3. [Install Required Software](#3-install-required-software)
4. [Setup CyberPanel (Optional)](#4-setup-cyberpanel-optional)
5. [Database Setup](#5-database-setup)
6. [Firewall Configuration](#6-firewall-configuration)
7. [Performance Tuning](#7-performance-tuning)

---

## 1. Initial Server Setup

### 1.1 Login Pertama Kali

```bash
# SSH ke VPS sebagai root
ssh root@your-vps-ip

# Atau dengan custom port
ssh -p 2222 root@your-vps-ip
```

### 1.2 Update System

```bash
# Update package list
apt update

# Upgrade semua packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git vim nano htop net-tools software-properties-common
```

### 1.3 Set Timezone

```bash
# Cek timezone sekarang
timedatectl

# Set ke Asia/Jakarta (WIB)
timedatectl set-timezone Asia/Jakarta

# Atau pilih timezone lain
dpkg-reconfigure tzdata
```

### 1.4 Set Hostname

```bash
# Set hostname
hostnamectl set-hostname rps-server

# Verify
hostnamectl
```

### 1.5 Create Non-Root User (Recommended)

```bash
# Create user
adduser rpsadmin

# Add to sudo group
usermod -aG sudo rpsadmin

# Test login (buka terminal baru)
ssh rpsadmin@your-vps-ip
```

---

## 2. Security Hardening

### 2.1 Setup SSH Key Authentication

**Di komputer lokal Anda:**

```bash
# Generate SSH key (jika belum punya)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key ke server
ssh-copy-id root@your-vps-ip

# Atau manual:
cat ~/.ssh/id_rsa.pub
# Copy outputnya
```

**Di VPS:**

```bash
# Buat .ssh directory (jika belum ada)
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Paste public key
nano ~/.ssh/authorized_keys
# Paste public key, save & exit

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

### 2.2 Disable Password Authentication (Setelah SSH Key Setup)

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Cari dan ubah/uncomment:
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password  # Atau 'no' untuk disable root login

# Restart SSH
systemctl restart sshd
```

⚠️ **PENTING:** Pastikan SSH key sudah work sebelum disable password!

### 2.3 Change SSH Port (Optional - Extra Security)

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Cari dan ubah:
Port 2222  # Ganti 22 ke custom port

# Restart SSH
systemctl restart sshd

# Login dengan port baru:
# ssh -p 2222 root@your-vps-ip
```

### 2.4 Install Fail2Ban

```bash
# Install
apt install -y fail2ban

# Copy default config
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
nano /etc/fail2ban/jail.local

# Cari [sshd] section, pastikan enabled:
[sshd]
enabled = true
port = 22  # Ganti jika pakai custom port
maxretry = 3
bantime = 3600

# Start fail2ban
systemctl start fail2ban
systemctl enable fail2ban

# Check status
fail2ban-client status sshd
```

---

## 3. Install Required Software

### 3.1 Install Node.js 18.x LTS

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install Node.js
apt install -y nodejs

# Verify
node -v  # Should show v18.x.x
npm -v   # Should show 9.x.x
```

### 3.2 Install PostgreSQL 14

```bash
# Install
apt install -y postgresql postgresql-contrib

# Start and enable
systemctl start postgresql
systemctl enable postgresql

# Check status
systemctl status postgresql

# Verify version
sudo -u postgres psql -c "SELECT version();"
```

### 3.3 Install PM2 Process Manager

```bash
# Install globally
npm install -g pm2

# Verify
pm2 -v

# Setup startup script (optional)
pm2 startup systemd
# Follow on-screen instructions
```

### 3.4 Install Nginx

```bash
# Install
apt install -y nginx

# Start and enable
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx

# Verify
curl http://localhost
# Should show "Welcome to nginx!"
```

### 3.5 Install Build Tools

```bash
# Install build essentials (untuk compile native modules)
apt install -y build-essential python3 python3-pip

# Verify
gcc --version
python3 --version
```

---

## 4. Setup CyberPanel (Optional)

CyberPanel adalah control panel untuk manage websites dengan GUI.

### 4.1 Install CyberPanel

```bash
# Download installer
wget -O installer.sh https://cyberpanel.net/install.sh

# Make executable
chmod +x installer.sh

# Run installer
./installer.sh

# Follow prompts:
# - Choose OpenLiteSpeed (free) atau LiteSpeed Enterprise
# - Install Full service
# - Set admin password
```

### 4.2 Access CyberPanel

```
URL: https://your-vps-ip:8090
Username: admin
Password: [password yang Anda set]
```

### 4.3 Initial CyberPanel Configuration

1. **Login** ke CyberPanel
2. **Change password** (jika perlu)
3. **Create website** untuk domain Anda
4. **Setup SSL** via Let's Encrypt

⚠️ **Note:** Jika pakai CyberPanel, OpenLiteSpeed akan diinstall. Anda bisa tetap pakai Nginx untuk aplikasi Node.js (keduanya bisa coexist di port berbeda).

---

## 5. Database Setup

### 5.1 Secure PostgreSQL

```bash
# Set password untuk postgres user
sudo -u postgres psql

# Di psql prompt:
ALTER USER postgres WITH PASSWORD 'your_strong_password';
\q
```

### 5.2 Configure PostgreSQL

```bash
# Edit postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings (sesuaikan dengan RAM VPS):

# Memory settings (untuk VPS 4GB RAM)
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB

# Connection settings
max_connections = 100

# Save & exit
```

### 5.3 Restart PostgreSQL

```bash
systemctl restart postgresql
```

---

## 6. Firewall Configuration

### 6.1 Setup UFW (Uncomplicated Firewall)

```bash
# Install UFW (biasanya sudah terinstall)
apt install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (PENTING! Sebelum enable UFW)
ufw allow 22/tcp
# Atau jika pakai custom port:
# ufw allow 2222/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow CyberPanel (jika pakai)
ufw allow 8090/tcp

# Allow database (jika perlu akses dari luar)
# ufw allow 5432/tcp

# Enable firewall
ufw enable

# Check status
ufw status verbose
```

### 6.2 Allow Specific IPs Only (Extra Security)

```bash
# Allow SSH only from your IP
ufw delete allow 22/tcp
ufw allow from your-ip-address to any port 22

# Example:
# ufw allow from 203.0.113.10 to any port 22
```

---

## 7. Performance Tuning

### 7.1 Increase File Descriptors Limit

```bash
# Edit limits.conf
nano /etc/security/limits.conf

# Add at the end:
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536

# Edit sysctl.conf
nano /etc/sysctl.conf

# Add:
fs.file-max = 65536

# Apply
sysctl -p
```

### 7.2 Optimize Network Settings

```bash
# Edit sysctl.conf
nano /etc/sysctl.conf

# Add network optimizations:
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8096
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65000

# Apply
sysctl -p
```

### 7.3 Setup Swap (Jika RAM Terbatas)

```bash
# Check existing swap
swapon --show

# Create 2GB swap file
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Verify
free -h
```

### 7.4 Install Monitoring Tools

```bash
# Install htop
apt install -y htop

# Install iotop (disk I/O monitoring)
apt install -y iotop

# Install ncdu (disk usage)
apt install -y ncdu
```

---

## ✅ Pre-Deployment Checklist

Sebelum deploy aplikasi RPS, pastikan:

- ✅ System updated (`apt update && apt upgrade`)
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed & running
- ✅ PM2 installed globally
- ✅ Nginx installed & running
- ✅ Firewall (UFW) configured
- ✅ SSH key authentication setup
- ✅ Timezone set correctly
- ✅ Swap enabled (jika RAM < 4GB)
- ✅ Domain sudah pointing ke VPS IP

---

## 🔍 Verify Installation

```bash
# Check Node.js
node -v && npm -v

# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Check Nginx
sudo systemctl status nginx
curl http://localhost

# Check PM2
pm2 -v

# Check firewall
sudo ufw status

# Check memory & disk
free -h
df -h

# Check listening ports
sudo netstat -tulpn | grep LISTEN
```

---

## 🎯 Next Steps

Setelah VPS setup selesai:

1. ✅ Clone repository aplikasi RPS
2. ✅ Follow [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)
3. ✅ Setup domain & SSL certificate
4. ✅ Configure regular backups

---

## 📞 Need Help?

Jika ada masalah saat setup VPS:

1. Check logs:
   ```bash
   journalctl -xe
   dmesg | tail
   ```

2. Restart services:
   ```bash
   systemctl restart postgresql nginx
   ```

3. Consult [Troubleshooting Guide](./troubleshooting.md)

---

**VPS Setup Complete! Ready untuk deployment! 🚀**

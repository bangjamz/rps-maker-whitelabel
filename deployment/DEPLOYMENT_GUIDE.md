# 🚀 Panduan Deployment RPS Management System ke VPS

**VPS:** Ubuntu 22.04 + CyberPanel  
**Aplikasi:** React + Node.js + PostgreSQL  
**Estimasi Waktu:** 30-60 menit

---

## 📋 Daftar Isi

1. [Persiapan VPS](#1-persiapan-vps)
2. [Install Dependencies](#2-install-dependencies)
3. [Clone Repository](#3-clone-repository)
4. [Konfigurasi Database](#4-konfigurasi-database)
5. [Konfigurasi Aplikasi](#5-konfigurasi-aplikasi)
6. [Jalankan Auto Deploy](#6-jalankan-auto-deploy)
7. [Setup Nginx di CyberPanel](#7-setup-nginx-di-cyberpanel)
8. [Setup SSL Certificate](#8-setup-ssl-certificate)
9. [Verifikasi Deployment](#9-verifikasi-deployment)
10. [Maintenance & Update](#10-maintenance--update)

---

## 1. Persiapan VPS

### 1.1 Spesifikasi Minimum

```
✅ VPS Minimum:
   - CPU: 2 Core
   - RAM: 4 GB
   - Storage: 50 GB SSD
   - Bandwidth: 100 Mbps
   - OS: Ubuntu 22.04 LTS

✅ VPS Recommended:
   - CPU: 4 Core
   - RAM: 8 GB
   - Storage: 100 GB SSD
   - Bandwidth: 1 Gbps
```

### 1.2 Akses VPS

```bash
# SSH ke VPS Anda
ssh root@your-vps-ip

# Atau jika pakai user biasa
ssh your-username@your-vps-ip
```

### 1.3 Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

---

## 2. Install Dependencies

### 2.1 Install Node.js 18.x (LTS)

```bash
# Download dan install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node -v  # Harus v18.x.x
npm -v   # Harus 9.x.x atau lebih
```

### 2.2 Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verifikasi
sudo systemctl status postgresql
```

### 2.3 Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verifikasi
pm2 -v
```

### 2.4 Install Nginx (Jika Belum Ada)

CyberPanel biasanya sudah include OpenLiteSpeed, tapi untuk Nginx:

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verifikasi
sudo systemctl status nginx
```

---

## 3. Clone Repository

### 3.1 Setup Deployment Directory

```bash
# Buat directory untuk aplikasi
sudo mkdir -p /var/www/rps

# Set ownership (ganti 'root' dengan user Anda jika perlu)
sudo chown -R $USER:$USER /var/www/rps

# Masuk ke directory
cd /var/www/rps
```

### 3.2 Clone dari GitHub

```bash
# Clone repository
git clone https://github.com/bangjamz/rps-management-system.git .

# Atau jika sudah clone, pull latest
git pull origin main

# Verifikasi
ls -la
# Harus ada folder: client, server, deployment, docs
```

---

## 4. Konfigurasi Database

### 4.1 Buat Database dan User

```bash
# Masuk ke PostgreSQL sebagai postgres user
sudo -u postgres psql

# Di dalam psql, jalankan:
```

```sql
-- Buat database
CREATE DATABASE rps_db;

-- Buat user
CREATE USER rps_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rps_db TO rps_user;

-- Connect ke database
\c rps_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rps_user;

-- Keluar
\q
```

### 4.2 Test Koneksi Database

```bash
# Test koneksi
psql -h localhost -U rps_user -d rps_db -W

# Jika berhasil, ketik \q untuk keluar
```

### 4.3 Konfigurasi PostgreSQL untuk Remote Access (Optional)

Jika ingin akses database dari luar:

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Cari dan ubah:
listen_addresses = 'localhost'  # Ubah ke '*' untuk all
```

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Tambahkan di akhir file:
host    all             all             0.0.0.0/0            md5
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 5. Konfigurasi Aplikasi

### 5.1 Edit Deployment Script

```bash
cd /var/www/rps/deployment

# Edit deploy.sh - sesuaikan konfigurasi
nano deploy.sh
```

**Sesuaikan bagian ini:**

```bash
# Path aplikasi di VPS
APP_DIR="/var/www/rps"

# Domain Anda
DOMAIN="rps.universitasanda.ac.id"  # GANTI INI!

# Database Configuration
DB_NAME="rps_db"
DB_USER="rps_user"
DB_PASSWORD="your_secure_password_here"  # GANTI INI!
```

### 5.2 Simpan dan Keluar

```
Ctrl + O  (save)
Enter
Ctrl + X  (exit)
```

---

## 6. Jalankan Auto Deploy

### 6.1 Jalankan Script Deployment

```bash
cd /var/www/rps

# Jalankan dengan sudo
sudo ./deployment/deploy.sh
```

**Script akan otomatis:**
- ✅ Check semua dependencies
- ✅ Setup database
- ✅ Install backend dependencies
- ✅ Build frontend (React)
- ✅ Setup PM2 process manager
- ✅ Start aplikasi

### 6.2 Monitor Proses

```bash
# Lihat status PM2
pm2 list

# Lihat logs real-time
pm2 logs

# Monitor CPU & Memory
pm2 monit
```

### 6.3 Verifikasi Backend Berjalan

```bash
# Test backend API
curl http://localhost:5000/api/health

# Atau
curl http://localhost:5000/api/auth/test

# Harus return response (bukan error)
```

---

## 7. Setup Nginx di CyberPanel

### 7.1 Buat Website di CyberPanel

1. Login ke CyberPanel: `https://your-vps-ip:8090`
2. Masuk ke: **Websites → Create Website**
3. Isi form:
   - **Domain Name:** `rps.universitasanda.ac.id`
   - **Email:** email Anda
   - **Package:** Default
   - **PHP:** Pilih "None" (karena pakai Node.js)
4. Klik **Create Website**

### 7.2 Setup Custom Nginx Config

**Opsi A: Via CyberPanel UI** (Recommended)

1. Masuk ke: **Websites → List Websites**
2. Pilih domain Anda → **Manage**
3. Klik **vHost Conf** atau **Rewrite Rules**
4. Copy paste config dari `/var/www/rps/deployment/nginx.conf`
5. Sesuaikan:
   - Ganti `yourdomain.com` dengan domain Anda
   - Ganti path `/var/www/rps` sesuai lokasi aplikasi
6. Save

**Opsi B: Via SSH** (Manual)

```bash
# Copy nginx config template
sudo cp /var/www/rps/deployment/nginx.conf /etc/nginx/sites-available/rps

# Edit config
sudo nano /etc/nginx/sites-available/rps

# Sesuaikan:
# - Ganti 'yourdomain.com' dengan domain Anda
# - Ganti SSL certificate path (jika sudah ada)

# Enable site
sudo ln -s /etc/nginx/sites-available/rps /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Jika OK, reload nginx
sudo systemctl reload nginx
```

### 7.3 Konfigurasi Penting di Nginx Config

Pastikan bagian ini benar:

```nginx
# Root directory untuk React build
root /var/www/rps/client/dist;

# Reverse proxy ke backend
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    ...
}

# Serve React app
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 8. Setup SSL Certificate

### 8.1 Via CyberPanel (Paling Mudah!)

1. Login CyberPanel
2. Masuk ke: **SSL → Manage SSL**
3. Pilih domain Anda
4. Klik **Issue SSL**
5. Pilih **Let's Encrypt**
6. Tunggu proses selesai (1-2 menit)

### 8.2 Via Certbot (Manual)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d rps.universitasanda.ac.id -d www.rps.universitasanda.ac.id

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8.3 Verifikasi SSL

```bash
# Check SSL certificate
sudo certbot certificates

# Test HTTPS
curl -I https://rps.universitasanda.ac.id
```

---

## 9. Verifikasi Deployment

### 9.1 Check Backend

```bash
# Check PM2 status
pm2 list
# Status harus "online"

# Check backend logs
pm2 logs rps-backend --lines 50

# Check backend response
curl http://localhost:5000/api/health
```

### 9.2 Check Frontend

```bash
# Check apakah build exist
ls -la /var/www/rps/client/dist/

# Harus ada:
# - index.html
# - assets/ (JS, CSS files)
```

### 9.3 Check Website

1. Buka browser
2. Akses: `https://rps.universitasanda.ac.id`
3. Harus muncul halaman login RPS

### 9.4 Test Login

```
Default credentials:
- Admin: admin@university.edu / admin123
- Kaprodi: kaprodi@university.edu / password123
- Dosen: dosen@university.edu / password123
```

### 9.5 Check Database

```bash
# Masuk ke database
psql -h localhost -U rps_user -d rps_db

# Check tables
\dt

# Harus ada banyak tables (Users, Fakultas, RPS, dll)

# Check data
SELECT * FROM "Users" LIMIT 5;

# Keluar
\q
```

---

## 10. Maintenance & Update

### 10.1 Update Code dari Git

```bash
cd /var/www/rps

# Jalankan update script
sudo ./deployment/update.sh
```

Script akan otomatis:
- ✅ Backup .env files
- ✅ Pull latest code
- ✅ Update dependencies
- ✅ Rebuild frontend
- ✅ Restart aplikasi

### 10.2 Manual Update

```bash
cd /var/www/rps

# Pull latest code
git pull origin main

# Update backend
cd server
npm install --production

# Rebuild frontend
cd ../client
npm install
npm run build

# Restart PM2
pm2 reload ecosystem.config.js --env production

# Or restart specific app
pm2 restart rps-backend
```

### 10.3 Backup Database

```bash
# Buat backup directory
mkdir -p /var/www/rps/backups

# Backup database
pg_dump -h localhost -U rps_user -d rps_db > /var/www/rps/backups/rps_db_$(date +%Y%m%d_%H%M%S).sql

# Backup dengan compression
pg_dump -h localhost -U rps_user -d rps_db | gzip > /var/www/rps/backups/rps_db_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 10.4 Restore Database

```bash
# Restore dari backup
psql -h localhost -U rps_user -d rps_db < /var/www/rps/backups/rps_db_20260207_120000.sql

# Atau dari compressed backup
gunzip -c /var/www/rps/backups/rps_db_20260207_120000.sql.gz | psql -h localhost -U rps_user -d rps_db
```

### 10.5 Monitor Aplikasi

```bash
# Realtime monitoring
pm2 monit

# Logs
pm2 logs rps-backend

# Logs dengan filter
pm2 logs rps-backend --err  # Error logs only

# Flush logs
pm2 flush
```

### 10.6 Restart Aplikasi

```bash
# Restart dengan zero-downtime (cluster mode)
pm2 reload rps-backend

# Hard restart
pm2 restart rps-backend

# Restart all
pm2 restart all

# Stop aplikasi
pm2 stop rps-backend

# Start aplikasi
pm2 start rps-backend
```

---

## 🎉 Deployment Selesai!

Aplikasi RPS Management System Anda sekarang sudah live di:

```
🌐 https://rps.universitasanda.ac.id
```

---

## 📞 Troubleshooting

Jika ada masalah, lihat:
- [Troubleshooting Guide](./troubleshooting.md)
- Check logs: `pm2 logs`
- Check nginx logs: `tail -f /var/log/nginx/error.log`
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`

---

## 🔒 Security Checklist

Setelah deployment, pastikan:

- ✅ Firewall enabled (ufw)
- ✅ SSH key-based authentication (disable password)
- ✅ Strong database password
- ✅ JWT_SECRET diganti dengan random string
- ✅ Regular backup database
- ✅ SSL certificate valid
- ✅ Update system regularly

---

**🎓 Happy Teaching & Learning!**

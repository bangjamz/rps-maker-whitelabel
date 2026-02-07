# 🔧 Troubleshooting Guide - RPS Management System

Panduan mengatasi masalah umum saat deployment dan operasional.

---

## 📋 Daftar Masalah Umum

1. [Backend Tidak Bisa Start](#1-backend-tidak-bisa-start)
2. [Frontend Tidak Muncul](#2-frontend-tidak-muncul)
3. [Database Connection Error](#3-database-connection-error)
4. [PM2 Process Mati Terus](#4-pm2-process-mati-terus)
5. [Nginx 502 Bad Gateway](#5-nginx-502-bad-gateway)
6. [API Request Lambat](#6-api-request-lambat)
7. [SSL Certificate Error](#7-ssl-certificate-error)
8. [Memory/CPU Usage Tinggi](#8-memorycpu-usage-tinggi)

---

## 1. Backend Tidak Bisa Start

### Gejala
```bash
pm2 list
# Status: errored atau stopped
```

### Diagnosa

```bash
# Check logs PM2
pm2 logs rps-backend --lines 100

# Check error di log file
tail -f /var/www/rps/logs/pm2-error.log
```

### Penyebab & Solusi

#### A. Port 5000 Sudah Dipakai

**Check:**
```bash
sudo netstat -tulpn | grep 5000
# atau
sudo lsof -i :5000
```

**Solusi:**
```bash
# Kill process yang pakai port 5000
sudo kill -9 <PID>

# Atau ganti port di .env
nano /var/www/rps/server/.env
# PORT=5001

# Restart PM2
pm2 restart rps-backend
```

#### B. Environment Variables Salah

**Check:**
```bash
cat /var/www/rps/server/.env
```

**Pastikan:**
- `DB_HOST=localhost`
- `DB_NAME` sesuai dengan database yang dibuat
- `DB_USER` dan `DB_PASSWORD` benar
- `JWT_SECRET` sudah diisi

**Solusi:**
```bash
# Edit .env
nano /var/www/rps/server/.env

# Restart
pm2 restart rps-backend
```

#### C. Dependencies Belum Terinstall

**Solusi:**
```bash
cd /var/www/rps/server
npm install --production
pm2 restart rps-backend
```

#### D. Sequelize Sync Error

**Gejala:** Error saat sync database

**Solusi:**
```bash
# Drop semua tables dan recreate (HATI-HATI! Data hilang!)
sudo -u postgres psql -d rps_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Atau drop & create ulang database
sudo -u postgres psql <<EOF
DROP DATABASE rps_db;
CREATE DATABASE rps_db;
GRANT ALL PRIVILEGES ON DATABASE rps_db TO rps_user;
\c rps_db
GRANT ALL ON SCHEMA public TO rps_user;
EOF

# Restart backend (akan auto sync)
pm2 restart rps-backend
```

---

## 2. Frontend Tidak Muncul

### Gejala
- Buka browser, halaman blank/404
- Atau muncul "Welcome to Nginx"

### Diagnosa

```bash
# Check apakah build exist
ls -la /var/www/rps/client/dist/

# Harus ada index.html dan assets/
```

### Solusi

#### A. Frontend Belum Di-build

```bash
cd /var/www/rps/client
npm install
npm run build

# Check output
ls -la dist/
```

#### B. Nginx Root Path Salah

**Check nginx config:**
```bash
sudo nano /etc/nginx/sites-available/rps
```

**Pastikan:**
```nginx
root /var/www/rps/client/dist;
index index.html;
```

**Reload nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### C. Permissions Salah

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/rps/client/dist

# Set permissions
sudo chmod -R 755 /var/www/rps/client/dist
```

---

## 3. Database Connection Error

### Gejala
```
Error: connect ECONNREFUSED 127.0.0.1:5432
atau
password authentication failed for user "rps_user"
```

### Diagnosa

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check apakah listening
sudo netstat -tulpn | grep 5432

# Test connection
psql -h localhost -U rps_user -d rps_db
```

### Solusi

#### A. PostgreSQL Tidak Jalan

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

#### B. User/Password Salah

```bash
# Reset password user
sudo -u postgres psql

# Di psql:
ALTER USER rps_user WITH PASSWORD 'new_password_here';
\q

# Update .env
nano /var/www/rps/server/.env
# DB_PASSWORD=new_password_here

# Restart backend
pm2 restart rps-backend
```

#### C. Database Tidak Exist

```bash
# Check databases
sudo -u postgres psql -c "\l"

# Jika tidak ada, create
sudo -u postgres psql <<EOF
CREATE DATABASE rps_db;
GRANT ALL PRIVILEGES ON DATABASE rps_db TO rps_user;
EOF
```

#### D. PostgreSQL Tidak Listen di Localhost

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Cari dan set:
listen_addresses = 'localhost'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 4. PM2 Process Mati Terus

### Gejala
```bash
pm2 list
# Status: stopped, errored, restart: >10
```

### Diagnosa

```bash
# Check logs
pm2 logs rps-backend --err

# Check PM2 info
pm2 info rps-backend
```

### Solusi

#### A. Memory Limit Exceeded

**Gejala:** `max_memory_restart` triggered

```bash
# Naikkan memory limit di ecosystem.config.js
nano /var/www/rps/deployment/ecosystem.config.js

# Ubah:
max_memory_restart: '2G'  # Dari 1G ke 2G

# Reload
pm2 reload ecosystem.config.js --env production
```

#### B. Uncaught Exception

**Check logs untuk error:**
```bash
pm2 logs rps-backend --lines 200 | grep -i error
```

**Fix code error, lalu:**
```bash
git pull origin main
cd /var/www/rps/server
npm install
pm2 restart rps-backend
```

#### C. Too Many Restarts

```bash
# Reset restarts counter
pm2 reset rps-backend

# Atau delete dan start ulang
pm2 delete rps-backend
pm2 start /var/www/rps/deployment/ecosystem.config.js --env production
```

---

## 5. Nginx 502 Bad Gateway

### Gejala
Browser menampilkan "502 Bad Gateway"

### Diagnosa

```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Check apakah backend jalan
pm2 list

# Test backend langsung
curl http://localhost:5000/api/health
```

### Solusi

#### A. Backend Tidak Jalan

```bash
# Start backend
pm2 start rps-backend

# Or reload
pm2 reload ecosystem.config.js --env production
```

#### B. Proxy Pass Salah

**Check nginx config:**
```bash
sudo nano /etc/nginx/sites-available/rps
```

**Pastikan:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;  # Port harus sama dengan backend
    ...
}
```

**Reload nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### C. Nginx Tidak Bisa Connect ke Backend

**Check firewall:**
```bash
sudo ufw status

# Allow localhost communication
sudo ufw allow from 127.0.0.1
```

---

## 6. API Request Lambat

### Gejala
Request > 2-3 detik

### Diagnosa

```bash
# Monitor CPU & Memory
pm2 monit

# Check database queries
# Lihat di logs apakah ada slow query

# Test langsung
time curl http://localhost:5000/api/some-endpoint
```

### Solusi

#### A. Database Query Lambat

**Add indexes:**
```sql
-- Masuk ke database
psql -h localhost -U rps_user -d rps_db

-- Add indexes untuk foreign keys
CREATE INDEX IF NOT EXISTS idx_rps_mata_kuliah_id ON "RPS"("mataKuliahId");
CREATE INDEX IF NOT EXISTS idx_rps_dosen_id ON "RPS"("dosenId");
CREATE INDEX IF NOT EXISTS idx_mahasiswa_prodi_id ON "Mahasiswa"("prodiId");
-- dst...

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM "RPS" WHERE "mataKuliahId" = 1;
```

#### B. PM2 Cluster Mode Tidak Aktif

**Check:**
```bash
pm2 list
# Lihat kolom "mode", harus "cluster"
```

**Fix:**
```bash
nano /var/www/rps/deployment/ecosystem.config.js

# Pastikan:
instances: 'max',
exec_mode: 'cluster'

# Reload
pm2 reload ecosystem.config.js --env production
```

#### C. VPS Resource Terbatas

**Upgrade VPS RAM/CPU**

Atau **optimize:**
```bash
# Limit PM2 instances
nano /var/www/rps/deployment/ecosystem.config.js

# Ubah:
instances: 2  # Dari 'max' ke 2

# Reload
pm2 reload ecosystem.config.js --env production
```

---

## 7. SSL Certificate Error

### Gejala
- Browser warning "Not Secure"
- Certificate expired

### Diagnosa

```bash
# Check certificate
sudo certbot certificates

# Check expiry date
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -noout -dates
```

### Solusi

#### A. Certificate Expired

```bash
# Renew certificate
sudo certbot renew

# Force renew
sudo certbot renew --force-renewal

# Reload nginx
sudo systemctl reload nginx
```

#### B. Auto-renewal Tidak Jalan

```bash
# Check certbot timer
sudo systemctl status certbot.timer

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## 8. Memory/CPU Usage Tinggi

### Gejala
```bash
pm2 monit
# Memory > 80% atau CPU > 90%
```

### Diagnosa

```bash
# Check process usage
htop

# Check PM2 details
pm2 info rps-backend
```

### Solusi

#### A. Memory Leak

**Restart periodic:**
```bash
# Setup cron job untuk restart malam
sudo crontab -e

# Add:
0 3 * * * pm2 restart rps-backend
```

#### B. Too Many Instances

```bash
# Reduce instances
nano /var/www/rps/deployment/ecosystem.config.js

# Ubah:
instances: 2  # Dari 'max'

pm2 reload ecosystem.config.js --env production
```

#### C. Optimize Database

```bash
# Vacuum database (cleanup)
psql -h localhost -U rps_user -d rps_db -c "VACUUM ANALYZE;"

# Add more memory to PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf

# Ubah (sesuaikan dengan RAM):
shared_buffers = 256MB
effective_cache_size = 1GB

sudo systemctl restart postgresql
```

---

## 🆘 Emergency Commands

### Hard Reset Aplikasi

```bash
# Stop semua PM2
pm2 stop all

# Kill all node processes
pkill -9 node

# Start ulang
cd /var/www/rps
pm2 start deployment/ecosystem.config.js --env production
```

### Check All Services

```bash
# PostgreSQL
sudo systemctl status postgresql

# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# Disk space
df -h

# Memory
free -h
```

### Restore from Backup

```bash
# Stop aplikasi
pm2 stop rps-backend

# Restore database
psql -h localhost -U rps_user -d rps_db < /var/www/rps/backups/latest.sql

# Start aplikasi
pm2 start rps-backend
```

---

## 📞 Still Having Issues?

Jika masalah belum teratasi:

1. **Check all logs:**
   ```bash
   pm2 logs rps-backend
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

2. **Restart everything:**
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   sudo systemctl restart postgresql
   ```

3. **Contact developer** dengan:
   - Error message lengkap
   - Output dari `pm2 logs`
   - Output dari `pm2 info rps-backend`
   - VPS specs

---

**Good luck! 🚀**

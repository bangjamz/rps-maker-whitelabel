#!/bin/bash

# ============================================
# RPS Management System - Auto Deployment Script
# Ubuntu 22.04 + CyberPanel
# ============================================

set -e # Exit on error

# WARNA untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# KONFIGURASI (SESUAIKAN!)
# ============================================

# Path aplikasi di VPS
APP_DIR="/var/www/rps"

# Domain Anda
DOMAIN="yourdomain.com"

# Database Configuration
DB_NAME="rps_db"
DB_USER="rps_user"
DB_PASSWORD="your_secure_password_here" # GANTI INI!

# Node.js version (akan dicheck)
REQUIRED_NODE_VERSION="18"

# ============================================
# FUNCTIONS
# ============================================

print_step() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Script ini harus dijalankan sebagai root (sudo)"
        exit 1
    fi
}

check_dependencies() {
    print_step "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js tidak terinstall!"
        echo "Install dulu dengan: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
        print_error "Node.js version harus >= $REQUIRED_NODE_VERSION (sekarang: v$NODE_VERSION)"
        exit 1
    fi
    print_success "Node.js $(node -v) ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm tidak terinstall!"
        exit 1
    fi
    print_success "npm $(npm -v) ✓"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL tidak terinstall!"
        echo "Install dulu dengan: sudo apt install postgresql postgresql-contrib -y"
        exit 1
    fi
    print_success "PostgreSQL $(psql --version | awk '{print $3}') ✓"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 tidak terinstall, akan diinstall otomatis..."
        npm install -g pm2
    fi
    print_success "PM2 $(pm2 -v) ✓"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git tidak terinstall!"
        echo "Install dulu dengan: sudo apt install git -y"
        exit 1
    fi
    print_success "Git $(git --version | awk '{print $3}') ✓"
}

setup_database() {
    print_step "Setting up PostgreSQL database..."
    
    # Check if database exists
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
    
    if [ "$DB_EXISTS" = "1" ]; then
        print_warning "Database '$DB_NAME' sudah ada, skip creation"
    else
        print_step "Creating database '$DB_NAME'..."
        sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
        print_success "Database created successfully!"
    fi
}

install_backend() {
    print_step "Installing backend dependencies..."
    
    cd "$APP_DIR/server"
    
    # Install dependencies
    npm install --production
    
    # Create .env file if not exists
    if [ ! -f .env ]; then
        print_step "Creating .env file..."
        cat > .env <<EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Secret (GANTI dengan random string!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=https://$DOMAIN
EOF
        print_success ".env file created"
    else
        print_warning ".env already exists, skipping"
    fi
    
    print_success "Backend dependencies installed!"
}

build_frontend() {
    print_step "Building frontend (React + Vite)..."
    
    cd "$APP_DIR/client"
    
    # Install dependencies
    npm install
    
    # Create .env.production if not exists
    if [ ! -f .env.production ]; then
        print_step "Creating .env.production..."
        cat > .env.production <<EOF
VITE_API_URL=https://$DOMAIN/api
VITE_APP_NAME=RPS Management System
EOF
        print_success ".env.production created"
    fi
    
    # Build
    npm run build
    
    print_success "Frontend built successfully! (output: client/dist)"
}

setup_pm2() {
    print_step "Setting up PM2 process manager..."
    
    cd "$APP_DIR"
    
    # Stop existing PM2 processes
    pm2 delete rps-backend 2>/dev/null || true
    
    # Start with ecosystem config
    pm2 start deployment/ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    print_success "PM2 configured and started!"
}

setup_nginx() {
    print_step "Setting up Nginx configuration..."
    
    NGINX_AVAILABLE="/etc/nginx/sites-available/rps"
    NGINX_ENABLED="/etc/nginx/sites-enabled/rps"
    
    # Backup existing config if exists
    if [ -f "$NGINX_AVAILABLE" ]; then
        print_warning "Backing up existing nginx config..."
        cp "$NGINX_AVAILABLE" "$NGINX_AVAILABLE.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy nginx config
    cp "$APP_DIR/deployment/nginx.conf" "$NGINX_AVAILABLE"
    
    # Update domain in config
    sed -i "s/yourdomain.com/$DOMAIN/g" "$NGINX_AVAILABLE"
    sed -i "s|/var/www/rps|$APP_DIR|g" "$NGINX_AVAILABLE"
    
    # Enable site
    ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    
    # Test nginx config
    if nginx -t; then
        print_success "Nginx config is valid!"
        systemctl reload nginx
        print_success "Nginx reloaded!"
    else
        print_error "Nginx config test failed!"
        exit 1
    fi
}

create_logs_directory() {
    print_step "Creating logs directory..."
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/server/logs"
    chmod 755 "$APP_DIR/logs"
    print_success "Logs directory created!"
}

run_migrations() {
    print_step "Running database migrations/seeders..."
    
    cd "$APP_DIR/server"
    
    # Jika ada migrations
    # npm run migrate
    
    # Atau sync models (hati-hati di production!)
    print_warning "Database sync akan dijalankan oleh aplikasi saat start"
    
    print_success "Database setup complete!"
}

print_completion() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 DEPLOYMENT BERHASIL! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}📊 Status Aplikasi:${NC}"
    pm2 list
    echo ""
    echo -e "${BLUE}🌐 URL Aplikasi:${NC}"
    echo -e "   https://$DOMAIN"
    echo ""
    echo -e "${BLUE}📝 Perintah Berguna:${NC}"
    echo -e "   ${YELLOW}pm2 list${NC}          - Lihat status aplikasi"
    echo -e "   ${YELLOW}pm2 logs${NC}          - Lihat logs aplikasi"
    echo -e "   ${YELLOW}pm2 restart all${NC}   - Restart aplikasi"
    echo -e "   ${YELLOW}pm2 monit${NC}         - Monitor real-time"
    echo ""
    echo -e "${BLUE}📁 Lokasi Penting:${NC}"
    echo -e "   App:    $APP_DIR"
    echo -e "   Logs:   $APP_DIR/logs"
    echo -e "   Nginx:  /etc/nginx/sites-available/rps"
    echo ""
    echo -e "${YELLOW}⚠️  Jangan lupa:${NC}"
    echo -e "   1. Setup SSL certificate (Let's Encrypt)"
    echo -e "   2. Ganti JWT_SECRET di .env dengan nilai random"
    echo -e "   3. Ganti DB_PASSWORD dengan password yang kuat"
    echo -e "   4. Setup firewall (ufw) untuk port 80, 443, 5432"
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================

main() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "  RPS Management System - Auto Deployment"
    echo "============================================"
    echo -e "${NC}"
    
    check_root
    check_dependencies
    create_logs_directory
    setup_database
    install_backend
    build_frontend
    setup_pm2
    
    print_warning "Nginx setup di-skip (setup manual via CyberPanel atau uncomment fungsi di bawah)"
    # setup_nginx  # Uncomment jika ingin auto-setup nginx
    
    print_completion
}

# Run main function
main

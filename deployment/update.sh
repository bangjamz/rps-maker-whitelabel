#!/bin/bash

# ============================================
# RPS Management System - Update Script
# Untuk update code setelah deployment pertama
# ============================================

set -e # Exit on error

# WARNA untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# KONFIGURASI
# ============================================

APP_DIR="/var/www/rps"

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

backup_env() {
    print_step "Backing up .env files..."
    
    if [ -f "$APP_DIR/server/.env" ]; then
        cp "$APP_DIR/server/.env" "$APP_DIR/server/.env.backup.$(date +%Y%m%d_%H%M%S)"
        print_success "Backend .env backed up"
    fi
    
    if [ -f "$APP_DIR/client/.env.production" ]; then
        cp "$APP_DIR/client/.env.production" "$APP_DIR/client/.env.production.backup.$(date +%Y%m%d_%H%M%S)"
        print_success "Frontend .env backed up"
    fi
}

pull_latest_code() {
    print_step "Pulling latest code from Git..."
    
    cd "$APP_DIR"
    
    # Stash any local changes
    git stash
    
    # Pull latest code
    git pull origin main
    
    print_success "Latest code pulled!"
}

update_backend() {
    print_step "Updating backend dependencies..."
    
    cd "$APP_DIR/server"
    
    # Install/update dependencies
    npm install --production
    
    print_success "Backend dependencies updated!"
}

update_frontend() {
    print_step "Rebuilding frontend..."
    
    cd "$APP_DIR/client"
    
    # Install/update dependencies
    npm install
    
    # Build
    npm run build
    
    print_success "Frontend rebuilt successfully!"
}

restart_application() {
    print_step "Restarting application..."
    
    # Reload PM2
    pm2 reload ecosystem.config.js --env production
    
    print_success "Application restarted!"
}

run_migrations() {
    print_step "Running database migrations (if any)..."
    
    cd "$APP_DIR/server"
    
    # Jika ada migrations
    # npm run migrate
    
    print_warning "No migrations to run (skipped)"
}

clear_cache() {
    print_step "Clearing cache..."
    
    # Clear nginx cache if exists
    if [ -d "/var/cache/nginx" ]; then
        rm -rf /var/cache/nginx/*
        print_success "Nginx cache cleared"
    fi
    
    # Reload nginx
    if command -v nginx &> /dev/null; then
        nginx -s reload
        print_success "Nginx reloaded"
    fi
}

print_completion() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 UPDATE BERHASIL! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}📊 Status Aplikasi:${NC}"
    pm2 list
    echo ""
    echo -e "${BLUE}📝 Perintah Berguna:${NC}"
    echo -e "   ${YELLOW}pm2 logs${NC}          - Lihat logs aplikasi"
    echo -e "   ${YELLOW}pm2 monit${NC}         - Monitor real-time"
    echo -e "   ${YELLOW}pm2 restart all${NC}   - Restart aplikasi"
    echo ""
}

# ============================================
# MAIN EXECUTION
# ============================================

main() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "  RPS Management System - Update Script"
    echo "============================================"
    echo -e "${NC}"
    
    check_root
    backup_env
    pull_latest_code
    update_backend
    update_frontend
    run_migrations
    restart_application
    clear_cache
    print_completion
}

# Run main function
main

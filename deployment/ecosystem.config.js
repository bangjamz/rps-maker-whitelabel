/**
 * PM2 Ecosystem Configuration
 * RPS Management System - Production
 * 
 * Dokumentasi: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // ========== APLIKASI INFO ==========
      name: 'rps-backend',
      script: './server/server.js',
      
      // ========== MODE CLUSTER (MULTI-CORE) ==========
      instances: 'max', // Gunakan semua CPU cores
      exec_mode: 'cluster', // Cluster mode untuk load balancing
      
      // ========== ENVIRONMENT ==========
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // ========== AUTO RESTART ==========
      watch: false, // Jangan auto-restart saat file berubah (production)
      autorestart: true, // Auto restart jika crash
      max_restarts: 10, // Max 10x restart dalam 1 menit
      min_uptime: '10s', // Min uptime sebelum dianggap stabil
      max_memory_restart: '1G', // Restart jika memory > 1GB
      
      // ========== LOGGING ==========
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // ========== ADVANCED ==========
      listen_timeout: 10000, // Timeout untuk listen
      kill_timeout: 5000, // Timeout untuk kill
      wait_ready: false,
      
      // ========== MONITORING ==========
      instance_var: 'INSTANCE_ID',
    }
  ],
  
  // ========== DEPLOYMENT (Optional - untuk auto deploy via PM2) ==========
  deploy: {
    production: {
      user: 'root', // Ganti dengan user VPS Anda
      host: 'your-vps-ip', // Ganti dengan IP VPS
      ref: 'origin/main',
      repo: 'https://github.com/bangjamz/rps-management-system.git',
      path: '/var/www/rps',
      'post-deploy': 'cd server && npm install && pm2 reload ecosystem.config.js --env production',
    }
  }
};

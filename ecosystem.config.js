// PM2 Ecosystem Config — for VPS deployment
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "hotbot-studios",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./",
      instances: "max",         // Use all CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};

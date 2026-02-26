#!/bin/bash
# ─── HotBot Studios — Deployment Script ─────────────────────────────────────
# Usage:
#   ./deploy.sh          → Build & restart with PM2
#   ./deploy.sh docker   → Build & run with Docker Compose
#   ./deploy.sh vercel   → Deploy to Vercel

set -e

MODE=${1:-pm2}

echo "🚀 HotBot Studios — Deploying ($MODE)..."

# Pull latest
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

case "$MODE" in
  docker)
    echo "🐳 Building Docker image..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ Docker deployment complete. Running on http://localhost:3000"
    ;;
  vercel)
    echo "▲ Deploying to Vercel..."
    npx vercel --prod
    ;;
  pm2|*)
    echo "🏗️  Building Next.js..."
    npm run build

    echo "⚙️  Starting/restarting PM2..."
    pm2 startOrRestart ecosystem.config.js --update-env
    pm2 save
    echo "✅ PM2 deployment complete."
    pm2 status
    ;;
esac

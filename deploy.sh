#!/bin/bash

# Deployment script for defi-prec-back
# Usage: ./deploy.sh [production|development]

set -e

ENV=${1:-production}

echo "🚀 Starting deployment for environment: $ENV"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your configuration."
    else
        echo "❌ .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "🛑 Stopping existing processes..."
pm2 stop defi-prec-api 2>/dev/null || true
pm2 delete defi-prec-api 2>/dev/null || true

# Start application with PM2
echo "▶️  Starting application with PM2..."
if [ "$ENV" = "production" ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env development
fi

# Save PM2 configuration
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Application status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs defi-prec-api"
echo "  - Restart: pm2 restart defi-prec-api"
echo "  - Stop: pm2 stop defi-prec-api"
echo "  - Monitor: pm2 monit"


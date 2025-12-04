# Deployment Guide

This guide explains how to deploy the defi-prec-back API server using npm and PM2.

## Prerequisites

- Node.js 18+ installed
- npm installed
- MongoDB database (local or Atlas)
- PM2 (will be installed automatically if missing)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nirdonia?retryWrites=true&w=majority
```

### 3. Deploy

#### Option A: Using the deployment script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Deploy to production
npm run deploy

# Or deploy to development
npm run deploy:dev
```

#### Option B: Manual deployment with PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the application
npm run pm2:start

# Save PM2 configuration
pm2 save
```

#### Option C: Simple npm start (for testing)

```bash
npm start
```

## PM2 Management Commands

```bash
# View logs
npm run pm2:logs
# or
pm2 logs defi-prec-api

# Restart application
npm run pm2:restart
# or
pm2 restart defi-prec-api

# Stop application
npm run pm2:stop
# or
pm2 stop defi-prec-api

# Monitor application
npm run pm2:monit
# or
pm2 monit

# View status
pm2 status

# View detailed info
pm2 show defi-prec-api
```

## Production Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defi-prec-back
   ```

2. **Install dependencies**
   ```bash
   npm ci --production
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Deploy with PM2**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh production
   ```

5. **Setup PM2 to start on system boot** (optional)
   ```bash
   pm2 startup
   pm2 save
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment mode | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |

## Health Check

The server includes a health check endpoint:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

## Troubleshooting

### Application won't start

1. Check if MongoDB is accessible:
   ```bash
   # Test MongoDB connection
   node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
   ```

2. Check logs:
   ```bash
   pm2 logs defi-prec-api
   ```

3. Verify environment variables:
   ```bash
   pm2 show defi-prec-api
   ```

### Port already in use

Change the `PORT` in `.env` file or stop the process using the port:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## Development Mode

For development with auto-reload:

```bash
npm run dev
# or
npm run server:dev
```

## Notes

- PM2 will automatically restart the application if it crashes
- Logs are stored in the `logs/` directory
- The application runs on port 3001 by default
- Make sure MongoDB is accessible from your server


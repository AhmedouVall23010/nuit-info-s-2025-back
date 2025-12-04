# Vercel Deployment Guide

This guide explains how to deploy the defi-prec-back API to Vercel.

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- Vercel CLI installed (`npm i -g vercel`)
- MongoDB Atlas connection string

## Quick Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nirdonia?retryWrites=true&w=majority
     NODE_ENV=production
     PORT=3001
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment (will ask questions)
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add NODE_ENV
   vercel env add PORT
   ```

## Project Structure for Vercel

```
defi-prec-back/
├── api/
│   └── index.js          # Vercel serverless function entry point
├── server/
│   ├── server.js         # Express app (exported, no app.listen in Vercel)
│   ├── routes/
│   ├── models/
│   └── config/
├── vercel.json           # Vercel configuration
└── package.json
```

## Configuration Files

### vercel.json
- Routes all requests to `api/index.js`
- Uses `@vercel/node` runtime
- Sets production environment

### api/index.js
- Exports the Express app as a serverless function
- Vercel handles the HTTP server

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (optional) | `3001` |

## Important Notes

### MongoDB Connection

- **MongoDB Atlas**: Make sure your IP address is whitelisted in MongoDB Atlas Network Access
- **Connection Pooling**: Vercel serverless functions create new connections, so use connection pooling
- **Cold Starts**: First request may be slower due to MongoDB connection

### Limitations

- **Function Timeout**: 10 seconds (Hobby), 60 seconds (Pro)
- **Request Size**: 4.5 MB limit
- **Response Size**: 4.5 MB limit
- **Cold Starts**: First request after inactivity may be slower

### Optimizations

1. **Keep MongoDB Connection Alive**
   - The current setup reconnects on each request
   - Consider using connection pooling or a connection manager

2. **Environment Variables**
   - Use Vercel's environment variables, not `.env` files
   - Different values for Production, Preview, and Development

3. **Build Settings**
   - Vercel auto-detects Node.js projects
   - Build command: `npm install` (automatic)
   - Output directory: Not needed (serverless functions)

## Testing Locally with Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Run Vercel Dev**
   ```bash
   vercel dev
   ```

3. **Access your API**
   - Local URL will be shown (usually `http://localhost:3000`)

## Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB Atlas

**Solutions**:
1. Check MongoDB Atlas Network Access (whitelist `0.0.0.0/0` for testing)
2. Verify connection string format
3. Check environment variables in Vercel dashboard
4. Review Vercel function logs

### Function Timeout

**Problem**: Request times out

**Solutions**:
1. Optimize database queries
2. Use connection pooling
3. Upgrade to Pro plan for longer timeouts
4. Check MongoDB Atlas performance

### Build Errors

**Problem**: Build fails on Vercel

**Solutions**:
1. Check `package.json` for correct Node.js version
2. Verify all dependencies are listed
3. Check build logs in Vercel dashboard
4. Test build locally: `npm install && npm start`

## URLs After Deployment

After deployment, you'll get URLs like:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

## API Endpoints

Once deployed, your endpoints will be available at:
- `https://your-project.vercel.app/` - Root endpoint
- `https://your-project.vercel.app/health` - Health check
- `https://your-project.vercel.app/api/council/posts` - Get posts
- `https://your-project.vercel.app/api-docs` - Swagger documentation

## Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to main/master branch
- **Preview**: On push to other branches
- **Pull Requests**: Automatic preview deployments

## Monitoring

- View logs in Vercel Dashboard → Functions → Logs
- Monitor performance in Vercel Dashboard → Analytics
- Set up alerts in Vercel Dashboard → Settings → Notifications


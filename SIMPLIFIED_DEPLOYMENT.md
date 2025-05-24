# LearnLink Simplified Deployment Guide

## Major Issue Fixed

We've fixed the container startup issue by simplifying the Docker configuration. The problem was with how the `start.sh` script was being created in the Dockerfile. Now, we use a physical file instead of generating one at build time.

## Simple Deployment (One-Step)

Run this single command to deploy:

```powershell
./deploy-railway.ps1
```

This script will:
1. Generate and set a secure JWT secret in Railway
2. Deploy your application
3. Provide links to verify the deployment

## Manual Deployment Steps (Alternative)

If you prefer to do it step by step:

1. **Set JWT Secret**:
   ```powershell
   ./set-railway-jwt-secret.ps1
   ```

2. **Deploy to Railway**:
   ```powershell
   railway up
   ```

3. **Verify Deployment**:
   Check the health endpoint at:
   ```
   https://learnlink-production.up.railway.app/api/health
   ```

## Troubleshooting

If you still encounter issues:

1. **Check Railway Logs**:
   ```powershell
   railway logs
   ```

2. **Verify Environment Variables**:
   ```powershell
   railway variables
   ```

3. **Manually Restart the Service**:
   ```powershell
   railway service restart
   ```

## Important Notes

- Make sure you have committed all changes before deploying
- The JWT secret must be at least 32 characters long
- All sensitive information is now handled via environment variables

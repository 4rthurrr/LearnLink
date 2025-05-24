# LearnLink Railway Deployment Guide

This guide provides comprehensive steps for deploying the LearnLink backend to Railway.

## Important Update: Fixed JWT Authentication Issues

We've updated the deployment process to address issues with the JWT authentication:

1. Fixed JWT environment variable handling in the Dockerfile
2. Added runtime verification of required environment variables
3. Created scripts to easily set JWT secrets in Railway
4. Enhanced error handling and feedback for environment variable issues

## Pre-Deployment Checklist

Before deploying, ensure you have:

1. A Railway account (https://railway.app/)
2. Railway CLI installed (`npm i -g @railway/cli`)
3. The LearnLink backend codebase cloned to your local machine
4. A MySQL database provisioned on Railway (or locally for testing)

## Step 1: Set Required Environment Variables

The most critical step is setting the proper environment variables in Railway:

### Set JWT Secret

Use our provided script to securely generate and set a JWT secret:

**For Linux/Mac:**
```bash
# Make the script executable
chmod +x set-railway-jwt-secret.sh

# Run the script to generate and set a secret
./set-railway-jwt-secret.sh
```

**For Windows:**
```powershell
# Run the PowerShell script to generate and set a secret
.\set-railway-jwt-secret.ps1
```

### Other Required Variables

Make sure these environment variables are set in your Railway project:

- `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQL_ROOT_PASSWORD` (these are automatically set by Railway if you provision a MySQL database)
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `APP_OAUTH2_REDIRECT_URI` - Set to your frontend OAuth callback URL (e.g., https://learn-link.vercel.app/oauth2/redirect)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS (e.g., https://learn-link.vercel.app,http://localhost:3000)

## Step 2: Deploy to Railway

### Option 1: Using Railway CLI

1. **Login to Railway**
   ```
   railway login
   ```

2. **Link your project**
   ```
   railway link
   ```

3. **Deploy the application**
   ```
   railway up
   ```

### Option 2: Using GitHub Integration

1. Connect your GitHub repository to Railway
2. Configure the deployment settings:
   - Select the repository and branch
   - Set the build command and start command
   - Configure environment variables

## Step 3: Verify Deployment

After deployment, verify that your application is running correctly:

1. **Check the application logs** in Railway dashboard for any errors
2. **Access the health endpoint** to verify the application is running:
   ```
   https://your-app-name.up.railway.app/api/health
   ```
3. **Test authentication** to ensure JWT is working correctly

## Troubleshooting

### JWT Related Issues

If you encounter issues with JWT authentication:

1. **Check if JWT_SECRET is set** in Railway environment variables
2. **Verify JWT_SECRET length** - It should be at least 32 characters long
3. **Check application logs** for specific JWT errors

### Database Connection Issues

If your application can't connect to the database:

1. **Verify database service** is running in Railway
2. **Check database credentials** in environment variables
3. **Check network settings** to ensure your application can access the database

### OAuth2 Configuration Issues

If OAuth login isn't working:

1. **Verify Google OAuth credentials** in environment variables
2. **Check redirect URI configuration** in Google Cloud Console
3. **Ensure frontend redirect URI** matches the backend configuration

## Local Testing

To test your Docker build locally before deploying:

**For Linux/Mac:**
```bash
./test-docker-local.sh
```

**For Windows:**
```
.\test-docker-local.bat
```

This will build and run your Docker image with test environment variables.

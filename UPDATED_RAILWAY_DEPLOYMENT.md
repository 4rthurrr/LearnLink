# Updated Railway Deployment Instructions

## Changes Made

We simplified the Docker configuration by removing the separate startup script approach that was causing issues. The application will now use environment variables directly from Railway without an intermediate script.

## Deployment Steps for Backend on Railway

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

4. **Set up Environment Variables**
   
   Make sure the following environment variables are configured in your Railway project:
   
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQL_ROOT_PASSWORD` (these are automatically set by Railway if you provision a MySQL database)
   - `JWT_SECRET` - Your JWT secret key
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
   - `APP_OAUTH2_REDIRECT_URI` - Set to your frontend OAuth callback URL (e.g., https://learn-link.vercel.app/oauth2/redirect)
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS (e.g., https://learn-link.vercel.app,http://localhost:3000)

5. **Verify Deployment**
   
   After deployment, you can verify that your application is running correctly by accessing the health endpoint:
   ```
   https://your-app-name.up.railway.app/api/health
   ```

## Deployment Steps for Frontend on Vercel

1. **Login to Vercel**
   
   If you're using Vercel CLI:
   ```
   vercel login
   ```
   Or deploy directly from the Vercel dashboard.

2. **Configure Environment Variables in Vercel**
   
   Set up the following environment variables:
   - `REACT_APP_API_BASE_URL` - Set to your Railway backend URL (e.g., https://learnlink-production.up.railway.app/api)
   - `REACT_APP_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID

3. **Deploy to Vercel**
   
   If using CLI:
   ```
   vercel --prod
   ```
   Or deploy from the Vercel dashboard by connecting your repository.

4. **Verify Frontend Deployment**
   
   Access your Vercel-deployed frontend and test the complete application flow, especially the OAuth authentication process.

## Troubleshooting

### Backend Issues

1. **Check Application Logs**
   
   In Railway dashboard, go to your application and check the logs for any errors.

2. **Verify Database Connection**
   
   Use the health endpoint to check if the application can connect to the database.

3. **Check Environment Variables**
   
   Make sure all required environment variables are set correctly in Railway.

### Frontend Issues

1. **CORS Errors**
   
   If you're seeing CORS errors, make sure the backend's `ALLOWED_ORIGINS` includes your frontend URL.

2. **OAuth Redirect Issues**
   
   Ensure the `APP_OAUTH2_REDIRECT_URI` in the backend matches the redirect URL configured in your frontend application.

3. **API Connection Issues**
   
   Verify that the `REACT_APP_API_BASE_URL` in your frontend points to the correct backend URL.

# Vercel Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the LearnLink React frontend to Vercel.

## Prerequisites

- A Vercel account (https://vercel.com/)
- Git repository with your LearnLink frontend code
- Successfully deployed backend on Railway

## Deployment Steps

### 1. Prepare Your Frontend Code

Make sure your frontend code has the correct configuration to connect to your Railway backend:

1. Check for environment variable usage in your codebase for API URL:
   ```javascript
   // Example from your API service file
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
   ```

2. Ensure OAuth configuration uses environment variables:
   ```javascript
   // Example from your OAuth configuration
   const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
   const REDIRECT_URI = process.env.REACT_APP_OAUTH_REDIRECT_URI || '/oauth2/redirect';
   ```

### 2. Deploy to Vercel

#### Option 1: Using Vercel Dashboard (Recommended for First Deployment)

1. **Login to Vercel**
   - Go to https://vercel.com/ and login to your account

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Select the repository that contains your frontend code
   - If your repository is not listed, you may need to import it or configure permissions

3. **Configure Project**
   - Set the Framework Preset to "Create React App" if using Create React App
   - Set the Root Directory to the frontend folder if your project has multiple folders
   - Configure Build Settings:
     - Build Command: `npm run build` or `yarn build`
     - Output Directory: `build` (for Create React App) or `dist` (for Vite)

4. **Environment Variables**
   - Add the following environment variables:
     - `REACT_APP_API_BASE_URL`: Your Railway backend URL (e.g., https://learnlink-production.up.railway.app/api)
     - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
     - `REACT_APP_OAUTH_REDIRECT_URI`: `/oauth2/redirect` (usually default)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete

#### Option 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Your Frontend Directory**
   ```bash
   cd frontend
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```
   
   Follow the interactive prompts to configure your project.

5. **Set Environment Variables**
   ```bash
   vercel env add REACT_APP_API_BASE_URL
   vercel env add REACT_APP_GOOGLE_CLIENT_ID
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 3. Configure Authentication

Once your frontend is deployed, you'll need to update any OAuth configuration:

1. **Update Google OAuth Console**
   - Go to the Google Cloud Console
   - Navigate to your project's OAuth 2.0 configuration
   - Add your Vercel domain to the Authorized JavaScript origins
   - Add `https://your-vercel-domain.vercel.app/oauth2/redirect` to the Authorized redirect URIs

2. **Update Backend Configuration**
   - Make sure your Railway backend's `ALLOWED_ORIGINS` environment variable includes your Vercel frontend URL
   - Update `APP_OAUTH2_REDIRECT_URI` to match your Vercel frontend URL

### 4. Test the Deployment

1. **Access your deployed frontend**
   - Navigate to your Vercel URL (e.g., https://learn-link.vercel.app)

2. **Test the features**
   - Test user registration/login
   - Test Google OAuth login
   - Test core application features

### Troubleshooting

#### CORS Issues
If you encounter CORS errors:
- Check that your backend's `ALLOWED_ORIGINS` includes your Vercel domain
- Ensure your API requests include the correct headers

#### OAuth Redirect Problems
If OAuth redirects fail:
- Verify the Google OAuth configuration in Google Cloud Console
- Check that the redirect URIs are correctly set up
- Ensure the environment variables are correctly set in both frontend and backend

#### API Connection Issues
If your frontend can't connect to the backend:
- Verify the `REACT_APP_API_BASE_URL` is correct
- Check that your backend is running and accessible
- Test the API endpoints directly using a tool like Postman

#### Build Failures
If your build fails on Vercel:
- Check the build logs for specific errors
- Make sure all dependencies are correctly specified in package.json
- Verify that your project structure matches the expected structure for your framework

# LearnLink Deployment Guide

This guide will help you deploy your LearnLink fullstack application to Railway (backend) and Vercel (frontend).

## Backend Deployment to Railway

1. **Prepare your backend for deployment**
   - The backend has been configured to use environment variables from Railway
   - `application-prod.properties` has been updated to use Railway MySQL credentials
   - A `system.properties` file has been added to specify Java 17

2. **Deploy to Railway**
   - Create a Railway account if you don't have one
   - Install Railway CLI: `npm i -g @railway/cli`
   - Login to Railway: `railway login`
   - In the project directory, link your project: `railway link`
   - Deploy your backend: `railway up`
   - Add environment variables in Railway dashboard:
     - JWT_SECRET (generate a secure random string)
     - ALLOWED_ORIGINS (your frontend URL, e.g., https://learnlink.vercel.app)
     - FILE_UPLOAD_DIR (leave as default)

3. **Verify backend deployment**
   - Check the URL provided by Railway after deployment
   - Test the backend API by visiting `[railway-url]/api-docs`

## Frontend Deployment to Vercel

1. **Prepare your frontend for deployment**
   - The frontend configuration has been updated to use the Railway backend URL
   - A vercel.json configuration file has been added

2. **Deploy to Vercel**
   - Push your code to a GitHub repository
   - Create a Vercel account if you don't have one
   - Go to https://vercel.com/new to create a new project
   - Import your GitHub repository
   - Configure as follows:
     - Framework Preset: Create React App
     - Root Directory: frontend
     - Build Command: npm run build
     - Output Directory: build
   - Set environment variables:
     - REACT_APP_API_BASE_URL: Your Railway backend URL (https://[your-app-name].railway.app)
   - Click "Deploy"

3. **Verify frontend deployment**
   - Once deployment is complete, Vercel will provide a URL
   - Test the application by logging in and testing core functionality

## Database Information

- MySQL database is already set up on Railway
- Credentials are stored in Railway environment variables
- No further database setup is required as the backend will handle table creation

## Troubleshooting

- If you encounter CORS issues, verify the ALLOWED_ORIGINS variable includes your frontend URL
- For OAuth issues, make sure to update your Google API Console with the new frontend URL
- If uploads don't work, check that the FILE_UPLOAD_DIR is properly configured

## Next Steps

1. Set up a custom domain (optional)
2. Configure SSL certificates (handled automatically by Railway and Vercel)
3. Set up monitoring and logging
4. Configure backups for your database

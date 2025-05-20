# Railway Deployment Instructions

## Required Environment Variables

Add these variables to your Railway backend service:

```
# Database connection
DATABASE_URL=${{ MYSQL.MYSQL_URL }}

# JWT configuration

# OAuth configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# CORS and OAuth redirect configuration
ALLOWED_ORIGINS=https://learn-link.vercel.app,http://localhost:3000
```

## How to Add Variables in Railway

1. Go to your backend service in Railway
2. Click on "Variables" tab
3. Add the variables listed above
4. For DATABASE_URL, use Railway's variable reference syntax shown in the screenshot: `${{ MYSQL.MYSQL_URL }}`
5. Deploy your service again after setting these variables

## How Railway Variables Work

Railway automatically connects services through its variable reference system. When you add `${{ MYSQL.MYSQL_URL }}` as a variable value, Railway will substitute the actual MySQL connection string at runtime.

## Testing Connection

After deployment, check your application health endpoint:
```
https://your-app-name.up.railway.app/api/health
```

This will show you whether the database connection is working properly.

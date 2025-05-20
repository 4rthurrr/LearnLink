# Railway Database Setup Reference

When setting up your database connection in Railway, make sure to use the following environment variables:

## Required Variables

- `MYSQLHOST` - Your MySQL host (example: containers-us-west-xxx.railway.app)
- `MYSQLPORT` - Your MySQL port (usually 3306 on Railway)
- `MYSQLDATABASE` - Your database name (usually "railway" on Railway)
- `MYSQLUSER` - Your database username (usually "root" on Railway)
- `MYSQLPASSWORD` - Your database password

## Simplified Configuration

For simplicity, you can set these three variables instead:

- `SPRING_DATASOURCE_URL` - The full JDBC URL (example: jdbc:mysql://containers-us-west-xxx.railway.app:3306/railway?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC)
- `SPRING_DATASOURCE_USERNAME` - The database username (usually "root")
- `SPRING_DATASOURCE_PASSWORD` - The database password

## Important Notes

1. Do not use template variables like `${{VARIABLE}}` - Railway doesn't resolve these properly for Spring Boot applications
2. Use actual values (hostnames, passwords, etc.) in the environment variables
3. If you see "No such file or directory" errors, it means the Docker container can't execute the startup script

## Testing Your Connection

After deployment, check:
- Health endpoint: https://your-app-name.railway.app/api/health
- Application logs in Railway dashboard for database connection errors

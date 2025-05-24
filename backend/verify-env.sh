#!/bin/sh

# Simple Alpine-compatible script to verify if MySQL environment variables are set correctly
echo "Checking MySQL Environment Variables"
echo "==================================="
echo "MYSQLHOST: ${MYSQLHOST:-NOT SET}"
echo "MYSQLPORT: ${MYSQLPORT:-NOT SET}"
echo "MYSQLDATABASE: ${MYSQLDATABASE:-NOT SET}"
echo "MYSQLUSER: ${MYSQLUSER:-NOT SET}"
echo "MYSQLPASSWORD: ${MYSQLPASSWORD:-HIDDEN}"

echo "\nEffective Database URL:"
# Construct the URL from individual components if not defined directly
if [ -n "$SPRING_DATASOURCE_URL" ]; then
  echo "SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}"
else
  CONSTRUCTED_URL="jdbc:mysql://${MYSQLHOST:-localhost}:${MYSQLPORT:-3306}/${MYSQLDATABASE:-railway}?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true"
  echo "Constructed URL: ${CONSTRUCTED_URL}"
fi

# Check JWT Secret and OAuth2 configuration
echo "\nJWT and OAuth2 Configuration:"
echo "JWT_SECRET: ${JWT_SECRET:0:3}... (partial for security)"
echo "APP_OAUTH2_REDIRECT_URI: ${APP_OAUTH2_REDIRECT_URI:-NOT SET (will use default)}"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-NOT SET}"
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:3}... (partial for security)"

# Print Java version
echo "\nJava Version:"
java -version

echo "\nIf you're experiencing connection issues:"
echo "1. Verify that variables don't contain placeholder values like \${{VARIABLE}}"
echo "2. Use actual hostnames instead of placeholders"
echo "3. Check your Railway MySQL service status"
echo "4. Ensure JWT_SECRET is properly set for authentication"

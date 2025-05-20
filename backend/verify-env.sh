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

# Print Java version
echo "\nJava Version:"
java -version

echo "\nIf you're experiencing connection issues:"
echo "1. Verify that variables don't contain placeholder values like \${{VARIABLE}}"
echo "2. Use actual hostnames instead of placeholders"
echo "3. Check your Railway MySQL service status"

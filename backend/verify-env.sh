#!/bin/sh

# Script to verify important environment variables for LearnLink application
echo "========================================"
echo "LearnLink Environment Variable Check"
echo "========================================"

# Function to check if variable is set
check_var() {
  var_name=$1
  var_value=$2
  is_secret=$3
  
  if [ -z "$var_value" ]; then
    echo "❌ $var_name: NOT SET"
    return 1
  else
    if [ "$is_secret" = "true" ]; then
      # Show just the first 3 characters for secrets
      echo "✅ $var_name: ${var_value:0:3}... (partial for security)"
    else
      echo "✅ $var_name: $var_value"
    fi
    return 0
  fi
}

# Check database configuration
echo "\n📊 Database Configuration:"
db_ok=true
check_var "MYSQLHOST" "$MYSQLHOST" "false" || db_ok=false
check_var "MYSQLPORT" "$MYSQLPORT" "false" || db_ok=false
check_var "MYSQLDATABASE" "$MYSQLDATABASE" "false" || db_ok=false
check_var "MYSQLUSER" "$MYSQLUSER" "false" || db_ok=false

# Don't show the actual password, but check if it's set
if [ -z "$MYSQL_ROOT_PASSWORD" ] && [ -z "$MYSQLPASSWORD" ]; then
  echo "❌ Database Password: NOT SET"
  db_ok=false
else
  echo "✅ Database Password: Set (hidden)"
fi

# Effective Database URL
echo "\n🔗 Effective Database URL:"
if [ -n "$SPRING_DATASOURCE_URL" ]; then
  echo "Using SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}"
else
  host="${MYSQLHOST:-localhost}"
  port="${MYSQLPORT:-3306}"
  db="${MYSQLDATABASE:-railway}"
  CONSTRUCTED_URL="jdbc:mysql://$host:$port/$db?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true"
  echo "Constructed URL: $CONSTRUCTED_URL"
fi

# Check security configuration
echo "\n🔒 Security Configuration:"
check_var "JWT_SECRET" "$JWT_SECRET" "true"
if [ ${#JWT_SECRET} -lt 32 ] && [ -n "$JWT_SECRET" ]; then
  echo "⚠️ WARNING: JWT_SECRET is less than 32 characters long. This may not be secure for HS256 algorithm."
fi

# Check OAuth2 configuration
echo "\n🔑 OAuth2 Configuration:"
check_var "APP_OAUTH2_REDIRECT_URI" "${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}" "false"
check_var "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID" "false"
check_var "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET" "true"

# Check CORS configuration
echo "\n🌐 CORS Configuration:"
check_var "ALLOWED_ORIGINS" "${ALLOWED_ORIGINS:-https://learn-link.vercel.app,http://localhost:3000}" "false"

# Print Java version
echo "\n☕ Java Version:"
java -version

echo "\n🔍 Troubleshooting Tips:"
echo "1. If you're seeing database connection issues, verify MySQL service is running and accessible"
echo "2. For JWT authentication problems, ensure JWT_SECRET is set to a value at least 32 characters long"
echo "3. For CORS issues, verify that ALLOWED_ORIGINS includes your frontend domain"
echo "4. Check that environment variables don't contain placeholder values like \${{VARIABLE}}"
echo "========================================"

#!/bin/bash

# Get the actual values from the environment variables
echo "Extracting actual values from environment variables..."

ACTUAL_MYSQL_HOST=$(echo $MYSQLHOST | sed 's/\${{RAILWAY_PRIVATE_DOMAIN}}//')
ACTUAL_MYSQL_DB=$(echo $MYSQLDATABASE | sed 's/\${{MYSQL_DATABASE}}/railway/')
ACTUAL_MYSQL_PASSWORD=$(echo $MYSQLPASSWORD | sed 's/\${{MYSQL_ROOT_PASSWORD}}//')
ACTUAL_MYSQL_URL=$(echo $MYSQL_URL | sed 's/\${{MYSQLUSER}}/root/g' | sed "s/\${{MYSQL_ROOT_PASSWORD}}/$ACTUAL_MYSQL_PASSWORD/g" | sed "s/\${{RAILWAY_PRIVATE_DOMAIN}}/$ACTUAL_MYSQL_HOST/g" | sed "s/\${{MYSQL_DATABASE}}/$ACTUAL_MYSQL_DB/g")

echo "ACTUAL_MYSQL_HOST=$ACTUAL_MYSQL_HOST"
echo "ACTUAL_MYSQL_DB=$ACTUAL_MYSQL_DB"
echo "ACTUAL_MYSQL_PASSWORD=$ACTUAL_MYSQL_PASSWORD"
echo "ACTUAL_MYSQL_URL=$ACTUAL_MYSQL_URL"

# Export these as environment variables
export SPRING_DATASOURCE_URL="jdbc:$ACTUAL_MYSQL_URL"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="$ACTUAL_MYSQL_PASSWORD"

echo "Set environment variables:"
echo "SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL"
echo "SPRING_DATASOURCE_USERNAME=$SPRING_DATASOURCE_USERNAME"
echo "SPRING_DATASOURCE_PASSWORD=*******"

# Execute the application with these environment variables
exec "$@"

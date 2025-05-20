#!/bin/bash

echo "Railway Database Connection Test"
echo "-------------------------------"

# Extract actual values
echo "MySQL Environment Variables:"
echo "MYSQLHOST: $MYSQLHOST"
echo "MYSQLPORT: $MYSQLPORT"
echo "MYSQLDATABASE: $MYSQLDATABASE"
echo "MYSQLUSER: $MYSQLUSER"
echo "MYSQL_URL: $MYSQL_URL"

# Try connecting with mysql client if available
if command -v mysql &> /dev/null; then
    echo -e "\nAttempting MySQL connection with mysql client..."
    mysql -h "$MYSQLHOST" -P "$MYSQLPORT" -u "$MYSQLUSER" -p"$MYSQLPASSWORD" -e "SELECT 'Connection successful!' as Status;"
    
    if [ $? -eq 0 ]; then
        echo "MySQL connection test: SUCCESS"
    else
        echo "MySQL connection test: FAILED"
    fi
else
    echo -e "\nmysql client not available. Skipping direct connection test."
fi

# Network diagnostics
echo -e "\nNetwork Diagnostics:"
echo "Checking connectivity to MySQL host..."
if command -v ping &> /dev/null; then
    ping -c 2 "$MYSQLHOST"
else
    echo "ping command not available"
fi

echo -e "\nTrying port connection with timeout of 5 seconds..."
if command -v nc &> /dev/null; then
    nc -z -v -w 5 "$MYSQLHOST" "$MYSQLPORT"
else
    echo "netcat (nc) command not available"
fi

echo -e "\nTrying to resolve DNS for MySQL host..."
if command -v nslookup &> /dev/null; then
    nslookup "$MYSQLHOST"
elif command -v host &> /dev/null; then
    host "$MYSQLHOST"
else
    echo "DNS lookup commands not available"
fi

echo -e "\nSummary:"
echo "If you're encountering connection issues, try these steps:"
echo "1. Check that MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, and MYSQLPASSWORD are correct"
echo "2. Verify your MySQL instance is running and accessible from your Railway service"
echo "3. Check if your database allows remote connections"
echo "4. Ensure network rules allow traffic between your service and database"

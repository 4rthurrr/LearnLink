#!/bin/bash
# Script to set JWT_SECRET in Railway

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI is not installed. Please install it first:"
    echo "npm i -g @railway/cli"
    exit 1
fi

# Check if JWT_SECRET is provided as an argument
if [ -z "$1" ]; then
    # Generate a secure random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT_SECRET: $JWT_SECRET"
else
    JWT_SECRET=$1
    echo "Using provided JWT_SECRET"
fi

# Set the JWT_SECRET in Railway
echo "Setting JWT_SECRET in Railway..."
railway variables set JWT_SECRET="$JWT_SECRET"

echo "JWT_SECRET has been set in Railway."
echo "You can now deploy your application with: railway up"

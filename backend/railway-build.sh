#!/bin/bash
# Build script for Railway deployment

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Clean and package with Maven
echo "Building with Maven..."
./mvnw clean package -DskipTests

echo "Build completed. Listing target directory:"
ls -la target/

# Copy the JAR file to the required location
echo "Moving JAR file to expected location..."
cp target/*.jar app.jar

echo "Build process completed successfully!"

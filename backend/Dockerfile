# Multi-stage build: First stage to build the application
FROM maven:3.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the project files
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Second stage: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install bash for script execution (useful for debugging)
RUN apk add --no-cache bash curl

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create a simple startup script
RUN echo '#!/bin/sh\n\
echo "Starting LearnLink application with profile: prod"\n\
echo "Database connection using DATABASE_URL variable"\n\
\n\
# Run the application\n\
java -jar app.jar --spring.profiles.active=prod\n\
' > /app/startup.sh

# Make the script executable
RUN chmod +x /app/startup.sh

# Expose the port
EXPOSE 8080

# Run the application with a simple startup script
ENTRYPOINT ["/app/startup.sh"]

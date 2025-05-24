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

# Install basic tools for debugging
RUN apk add --no-cache curl bash

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Copy scripts from the build stage
COPY --from=build /app/verify-env.sh /app/verify-env.sh
COPY --from=build /app/start.sh /app/start.sh

# Make scripts executable
RUN chmod +x /app/verify-env.sh
RUN chmod +x /app/start.sh

# Expose the port
EXPOSE 8080

# Run using the startup script
ENTRYPOINT ["/app/start.sh"]

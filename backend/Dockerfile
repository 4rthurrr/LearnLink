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

# Create a startup script to properly map environment variables
RUN echo '#!/bin/sh\n\
echo "Starting LearnLink application with profile: prod"\n\
\n\
# Map environment variables to Spring properties format\n\
export app_jwt_secret="${JWT_SECRET}"\n\
export app_oauth2_redirectUri="${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}"\n\
\n\
# Print environment variables for debugging (without sensitive data)\n\
echo "Database connection: MYSQLHOST=${MYSQLHOST}, MYSQLPORT=${MYSQLPORT}, MYSQLDATABASE=${MYSQLDATABASE}"\n\
echo "JWT Secret configured: ${JWT_SECRET:0:3}..."\n\
echo "OAuth2 redirect configured: ${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}"\n\
\n\
# Run the application\n\
java -jar app.jar \
--spring.profiles.active=prod \
--app.jwt.secret="${JWT_SECRET}" \
--app.oauth2.redirectUri="${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}" \
--spring.security.oauth2.client.registration.google.redirect-uri="${OAUTH2_GOOGLE_REDIRECT_URI:-https://learnlink-production.up.railway.app/api/auth/oauth2/callback/google}"\n\
' > /app/startup.sh

# Make the script executable
RUN chmod +x /app/startup.sh

# Expose the port
EXPOSE 8080

# Run the application using the startup script
ENTRYPOINT ["/app/startup.sh"]

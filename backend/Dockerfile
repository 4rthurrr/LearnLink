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

# Expose the port
EXPOSE 8080

# Run the application with environment variables
ENTRYPOINT ["sh", "-c", "java -jar app.jar --spring.profiles.active=prod \
--app.jwt.secret=\"${JWT_SECRET}\" \
--app.oauth2.redirectUri=\"${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}\" \
--spring.security.oauth2.client.registration.google.redirect-uri=\"${OAUTH2_GOOGLE_REDIRECT_URI:-https://learnlink-production.up.railway.app/api/auth/oauth2/callback/google}\""]

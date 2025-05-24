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

# Copy verification script
COPY --from=build /app/verify-env.sh /app/verify-env.sh
RUN chmod +x /app/verify-env.sh

# Create a startup script
RUN echo '#!/bin/sh\n\
\n\
# Run environment verification\n\
echo "Verifying environment variables..."\n\
/app/verify-env.sh\n\
\n\
# Check if JWT_SECRET is set\n\
if [ -z "$JWT_SECRET" ]; then\n\
  echo "ERROR: JWT_SECRET environment variable is not set! Application will not start correctly."\n\
  echo "Please set JWT_SECRET in your Railway environment variables."\n\
  exit 1\n\
fi\n\
\n\
# Run the application\n\
echo "Starting LearnLink application..."\n\
exec java -jar app.jar \\\n\
  --spring.profiles.active=prod \\\n\
  --app.jwt.secret="$JWT_SECRET" \\\n\
  --app.oauth2.redirectUri="${APP_OAUTH2_REDIRECT_URI:-https://learn-link.vercel.app/oauth2/redirect}" \\\n\
  --spring.security.oauth2.client.registration.google.redirect-uri="${OAUTH2_GOOGLE_REDIRECT_URI:-https://learnlink-production.up.railway.app/api/auth/oauth2/callback/google}"\n\
' > /app/start.sh

# Make script executable
RUN chmod +x /app/start.sh

# Expose the port
EXPOSE 8080

# Run using the startup script
ENTRYPOINT ["/app/start.sh"]

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

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Copy the database variable extraction script
COPY --from=build /app/extract-db-vars.sh /app/extract-db-vars.sh
RUN chmod +x /app/extract-db-vars.sh

# Expose the port
EXPOSE 8080

# Run the application with the script that extracts database variables
ENTRYPOINT ["/app/extract-db-vars.sh", "java", "-jar", "app.jar", "--spring.profiles.active=prod"]

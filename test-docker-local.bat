@echo off
REM Script to build and test Docker image locally on Windows

echo Building LearnLink Docker image...
cd backend
docker build -t learnlink-backend .

echo Running LearnLink Docker container with test environment variables...
docker run -d --name learnlink-test ^
  -e JWT_SECRET=testsecret123 ^
  -e MYSQLHOST=host.docker.internal ^
  -e MYSQLPORT=3306 ^
  -e MYSQLDATABASE=learnlink ^
  -e MYSQLUSER=root ^
  -e MYSQL_ROOT_PASSWORD=your_password ^
  -e GOOGLE_CLIENT_ID=test_client_id ^
  -e GOOGLE_CLIENT_SECRET=test_client_secret ^
  -e APP_OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/redirect ^
  -e ALLOWED_ORIGINS=http://localhost:3000 ^
  -p 8080:8080 ^
  learnlink-backend

echo Container started. Waiting for application to initialize...
timeout /t 10 /nobreak > nul

echo Testing health endpoint...
curl http://localhost:8080/api/health

echo.
echo View container logs with: docker logs learnlink-test
echo Stop container with: docker stop learnlink-test ^&^& docker rm learnlink-test

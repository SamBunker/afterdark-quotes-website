@echo off
echo Starting After Dark Quotes - Local Development Environment
echo.
echo Stopping any existing containers...
docker stop afterdark-quotes-local 2>nul
docker rm afterdark-quotes-local 2>nul
echo.
echo Starting fresh container...
docker run --rm --name afterdark-quotes-local -v "D:/Development Projects/afterdark-quotes-website/:/app" -w /app -p 3003:3003 --env-file .env.local node:18-slim bash -c "npm install --legacy-peer-deps && node app.js"

@echo off
cd "%~dp0..\..\.."
docker compose -f compose.microfrontends.yaml up --build --detach --force-recreate --wait insights
pause

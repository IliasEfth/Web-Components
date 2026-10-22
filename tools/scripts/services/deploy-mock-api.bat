@echo off
cd "%~dp0..\..\.."
docker compose -f compose.services.yaml up --build --detach --force-recreate --wait mock-api
pause

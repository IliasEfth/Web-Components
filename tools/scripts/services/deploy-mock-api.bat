@echo off
docker compose -f "%~dp0..\..\..\compose.services.yaml" up --build --detach --force-recreate --wait mock-api
pause

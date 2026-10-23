@echo off
docker compose -f "%~dp0..\..\..\compose.microfrontends.yaml" up --build --detach --force-recreate --wait orders
pause

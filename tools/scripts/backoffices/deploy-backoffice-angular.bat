@echo off
docker compose -f "%~dp0..\..\..\compose.backoffices.yaml" up --build --detach --force-recreate --wait backoffice-angular
pause

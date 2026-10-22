@echo off
cd "%~dp0..\..\.."
docker compose -f compose.backoffices.yaml up --build --detach --force-recreate --wait backoffice-react
pause

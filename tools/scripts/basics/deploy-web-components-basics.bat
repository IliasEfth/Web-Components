@echo off
cd "%~dp0..\..\.."
docker compose -f compose.basics.yaml up --build --detach --force-recreate --wait web-components-basics
pause

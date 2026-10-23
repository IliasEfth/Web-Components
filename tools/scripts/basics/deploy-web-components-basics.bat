@echo off
docker compose -f "%~dp0..\..\..\compose.basics.yaml" up --build --detach --force-recreate --wait web-components-basics
pause

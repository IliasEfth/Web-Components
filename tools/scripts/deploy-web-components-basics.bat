@echo off
cd "%~dp0..\.."
docker compose up --build --detach --force-recreate --no-deps --wait web-components-basics
pause

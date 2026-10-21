@echo off
cd "%~dp0..\.."
docker compose up --build --detach --wait
pause

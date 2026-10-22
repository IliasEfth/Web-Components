@echo off
cd "%~dp0..\.."
docker compose -f compose.services.yaml up --build --detach --wait
docker compose -f compose.microfrontends.yaml up --build --detach --wait
docker compose -f compose.backoffices.yaml up --build --detach --wait
docker compose -f compose.edge.yaml up --build --detach --wait
docker compose -f compose.basics.yaml up --build --detach --wait
pause

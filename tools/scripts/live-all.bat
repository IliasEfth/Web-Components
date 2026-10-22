@echo off
cd "%~dp0..\.."
docker compose -f compose.services.yaml up --build --detach --wait
start "shop-services" docker compose -f compose.services.yaml watch
start "shop-microfrontends" docker compose -f compose.microfrontends.yaml watch
start "shop-backoffices" docker compose -f compose.backoffices.yaml watch
start "shop-edge" docker compose -f compose.edge.yaml watch
start "shop-basics" docker compose -f compose.basics.yaml watch
pause

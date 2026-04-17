@echo off
docker-compose --env-file infra/dev.env -f infra/docker-compose.dev.yaml up --build

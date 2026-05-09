# Comandos

## Prender

docker compose -f docker-compose.dev.yaml up --buildsudo docker compose -f docker-compose.dev.yaml up --builddocker compose -f docker-compose.dev.yaml up -d --build # detached
docker compose --env-file dev.env -f docker-compose.dev.yaml up -d --build # con dev.env
docker compose --env-file dev.env -f docker-compose.prod.yaml up -d --build db
docker compose --env-file dev.env -f docker-compose.dev.yaml up -d --build -V # renueva los volúmenes anónimos

## apagar

docker compose -f docker-compose.dev.yaml down

# lista rápida para confirmar que está corriendo

docker compose -f docker-compose.dev.yaml ps

# logs

docker compose -f docker-compose.dev.yaml logs -f
docker compose -f docker-compose.dev.yaml logs -f backend
docker compose -f docker-compose.dev.yaml logs -f notifications-service
docker compose -f docker-compose.dev.yaml logs -f medicaments-service
docker compose -f docker-compose.prod.yaml logs -f salud-db-prod

# reiniciar un contenedor

docker compose -f docker-compose.dev.yaml restart backenddocker compose -f docker-compose.prod.yaml restart salud-db-proddocker compose -f docker-compose.dev.yaml restart notifications-servicedocker compose -f docker-compose.dev.yaml restart medicaments-service

# Para apagar SOLO el frontend y liberar recursos

docker compose -f docker-compose.dev.yaml stop frontend

# Para volverlo a arrancar cuando lo necesites

docker compose -f docker-compose.dev.yaml start backend

# Para reconstruir y relanzar

docker compose -f docker-compose.dev.yaml up -d --build backend

# estadísticas

docker stats

# Conectar a PostreSQL

docker compose -f docker-compose.dev.yaml exec db psql -U user_admin -d mi_base_de_datosdocker compose -f docker-compose.dev.yaml exec backend clear
basic commands\dt : Lists all tables\d : Shows schema\l : List all databases\q : Quit

# crear migración

## docker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli migration:generate --name create-patientsdocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli migration:generate --name create-patientsdocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli db:migrate:undodocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli db:migrate:undo:alldocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli db:dropdocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli db:createdocker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli db:migratedocker compose -f docker-compose.dev.yaml exec backend npm run db:diff:schema

# seeders

docker compose -f docker-compose.dev.yaml exec backend npx sequelize-cli seed:generate --name roles-iniciales

## alembic

# Ver el estado actual

alembic current

# Ver el historial de migraciones

alembic history

# Revertir la última migración

alembic downgrade -1

# Revertir todas las migraciones

alembic downgrade base
docker compose -f docker-compose.dev.yaml --env-file dev.env exec medicaments-service alembic alembic downgrade base
docker compose -f docker-compose.dev.yaml --env-file dev.env exec medicaments-service alembic init migrations
docker compose -f docker-compose.dev.yaml --env-file dev.env exec medicaments-service alembic revision --autogenerate -m "db initialize"
docker compose -f docker-compose.dev.yaml --env-file dev.env exec medicaments-service alembic upgrade head

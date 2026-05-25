FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get --no-install-recommends install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && adduser --disabled-password --no-create-home appuser

COPY requirements.txt .
RUN pip install --only-binary :all: --no-cache-dir -r requirements.txt

# 3. Copiar el código y cederle los permisos al usuario seguro de una vez
COPY --chown=appuser:appuser --chmod=0555 app/ ./app/
COPY --chown=appuser:appuser --chmod=0555 migrations/ ./migrations/

COPY --chown=appuser:appuser --chmod=0444 alembic.ini ./

# 4. Cambiar al usuario seguro
USER appuser

# Comando para desarrollo con hot-reload
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 5010"]
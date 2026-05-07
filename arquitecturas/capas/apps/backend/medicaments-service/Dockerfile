FROM python:3.11-slim

WORKDIR /app

# Instalación de dependencias de sistema necesarias para psycopg2 o herramientas de red
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Comando para desarrollo con hot-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5010", "--reload"]
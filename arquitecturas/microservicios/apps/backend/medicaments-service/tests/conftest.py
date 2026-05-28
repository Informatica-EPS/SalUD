import os
import pytest

# =================================================================
# 1. INYECTAR VARIABLES FALSAS ANTES DE IMPORTAR LA APLICACIÓN
# Esto engaña a Pydantic (config.py) para que no falle al arrancar
# =================================================================
os.environ["DB_NAME"] = "test_db"
os.environ["DB_USER"] = "test_user"
os.environ["DB_PASSWORD"] = "test_pass"
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "5432"
os.environ["BACKEND_URL"] = "http://test-backend"

from fastapi.testclient import TestClient
from main import app
from app.core.database import get_db

# 2. Creamos una base de datos Mock
def override_get_db():
    try:
        yield None 
    finally:
        pass

# 3. Le decimos a FastAPI que use la versión simulada
app.dependency_overrides[get_db] = override_get_db

# 4. Cliente de pruebas
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
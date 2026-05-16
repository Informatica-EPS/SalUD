import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.database import get_db

# 1. Creamos una base de datos de mentira (Mock) para que las pruebas
# no necesiten conectarse a la base de datos real en la nube.
def override_get_db():
    try:
        # Aquí se podría usar SQLite en memoria para necesitas probar lógica de BD
        yield None 
    finally:
        pass

# 2. Le decimos a FastAPI que cuando alguien pida 'get_db', use la versión simulada
app.dependency_overrides[get_db] = override_get_db

# 3. Creamos el cliente de pruebas
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
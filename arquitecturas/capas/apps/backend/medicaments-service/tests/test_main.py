def test_app_is_running(client):
    """
    Prueba básica: Verifica que FastAPI está levantando correctamente
    consultando la ruta de documentación autogenerada.
    """
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_medicaments_routes_exist(client):
    """
    Prueba que el router de medicamentos está integrado.
    GET /api/medicaments, prueba
    que al menos no devuelva un error 404 (Not Found).
    """
    response = client.get("/api/medicaments")
    
    # Comprobamos que la ruta existe. Si no pasamos autenticación o base de datos, 
    # podría devolver 401, 403, o 500, pero NO un 404.
    assert response.status_code != 404
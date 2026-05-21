import os
# Set mock environment variables before importing anything from the app
os.environ["DB_NAME"] = "test_db"
os.environ["DB_USER"] = "test_user"
os.environ["DB_PASSWORD"] = "test_password"
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "5432"
os.environ["BACKEND_URL"] = "http://test-backend"

import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
import httpx

from app.services.medicaments_service import MedicamentsService
from app.schemas.medicament_schema import MedicamentDispatchRequest


class TestMedicamentsService(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.repository = MagicMock()
        self.inventory_service = MagicMock()
        self.movement_service = MagicMock()
        self.service = MedicamentsService(
            repository=self.repository,
            inventory_service=self.inventory_service,
            movement_service=self.movement_service,
        )

    def test_get_all_medicaments(self):
        # Mock elements returned by the repository
        mock_medicament_1 = MagicMock()
        mock_medicament_1.id = 1
        mock_medicament_1.nombre = "Paracetamol"
        mock_medicament_1.inventario.total = 100
        mock_medicament_1.movimientos = ["mov1", "mov2"]

        mock_medicament_2 = MagicMock()
        mock_medicament_2.id = 2
        mock_medicament_2.nombre = "Ibuprofeno"
        mock_medicament_2.inventario.total = 50
        mock_medicament_2.movimientos = []

        self.repository.get_all.return_value = [mock_medicament_1, mock_medicament_2]

        result = self.service.get_all_medicaments()

        self.repository.get_all.assert_called_once()
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["id"], 1)
        self.assertEqual(result[0]["nombre"], "Paracetamol")
        self.assertEqual(result[0]["inventario"], 100)
        self.assertEqual(result[0]["movimientos"], ["mov1", "mov2"])
        self.assertEqual(result[1]["id"], 2)
        self.assertEqual(result[1]["inventario"], 50)

    @patch("app.services.medicaments_service.httpx.AsyncClient")
    async def test_dispatch_medicaments_success(self, mock_async_client_class):
        # Setup mock client
        mock_client = MagicMock()
        mock_client.post = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_async_client_class.return_value = mock_client

        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_client.post.return_value = mock_response

        # Request body
        body = MedicamentDispatchRequest(
            idMedicamento=1, idOrden=10, idPaciente=100, cantidad=5
        )

        result = await self.service.dispatch_medicaments(body)

        # Asserts
        mock_client.post.assert_called_once_with(
            "http://test-backend/api/orders/validate",
            json={"idPaciente": 100, "idOrden": 10, "idMedicamento": 1},
            timeout=5.0
        )
        mock_response.raise_for_status.assert_called_once()
        self.inventory_service.dispatch_medicaments.assert_called_once_with(1, 5)
        self.movement_service.create_dispatch_event.assert_called_once_with(1, 5, "admin")
        self.assertEqual(result, {"message": "Medicamento despachado con éxito"})

    @patch("app.services.medicaments_service.httpx.AsyncClient")
    async def test_dispatch_medicaments_timeout(self, mock_async_client_class):
        # Setup mock client throwing TimeoutException
        mock_client = MagicMock()
        mock_client.post = AsyncMock(side_effect=httpx.TimeoutException("Timeout error"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_async_client_class.return_value = mock_client

        body = MedicamentDispatchRequest(
            idMedicamento=1, idOrden=10, idPaciente=100, cantidad=5
        )

        with self.assertRaises(Exception) as context:
            await self.service.dispatch_medicaments(body)

        self.assertEqual(str(context.exception), "El servicio de órdenes no respondió a tiempo")
        self.inventory_service.dispatch_medicaments.assert_not_called()
        self.movement_service.create_dispatch_event.assert_not_called()

    @patch("app.services.medicaments_service.httpx.AsyncClient")
    async def test_dispatch_medicaments_connect_error(self, mock_async_client_class):
        # Setup mock client throwing ConnectError
        mock_client = MagicMock()
        mock_client.post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_async_client_class.return_value = mock_client

        body = MedicamentDispatchRequest(
            idMedicamento=1, idOrden=10, idPaciente=100, cantidad=5
        )

        with self.assertRaises(Exception) as context:
            await self.service.dispatch_medicaments(body)

        self.assertEqual(str(context.exception), "No se pudo conectar al servicio de órdenes")
        self.inventory_service.dispatch_medicaments.assert_not_called()
        self.movement_service.create_dispatch_event.assert_not_called()

    @patch("app.services.medicaments_service.httpx.AsyncClient")
    async def test_dispatch_medicaments_http_status_error_with_json(self, mock_async_client_class):
        mock_client = MagicMock()
        mock_client.post = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_async_client_class.return_value = mock_client

        # Mock HTTPStatusError with a json error message
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json = MagicMock(return_value={"message": "Orden inválida o vencida"})
        
        http_error = httpx.HTTPStatusError("Bad Request", request=None, response=mock_response)
        mock_response.raise_for_status.side_effect = http_error
        mock_client.post.return_value = mock_response

        body = MedicamentDispatchRequest(
            idMedicamento=1, idOrden=10, idPaciente=100, cantidad=5
        )

        with self.assertRaises(HTTPException) as context:
            await self.service.dispatch_medicaments(body)

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "Orden inválida o vencida")
        self.inventory_service.dispatch_medicaments.assert_not_called()
        self.movement_service.create_dispatch_event.assert_not_called()

    @patch("app.services.medicaments_service.httpx.AsyncClient")
    async def test_dispatch_medicaments_http_status_error_with_text(self, mock_async_client_class):
        mock_client = MagicMock()
        mock_client.post = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_async_client_class.return_value = mock_client

        # Mock HTTPStatusError with plain text response (when json() fails)
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json = MagicMock(side_effect=ValueError("No JSON"))
        mock_response.text = "Internal Server Error"
        
        http_error = httpx.HTTPStatusError("Internal Error", request=None, response=mock_response)
        mock_response.raise_for_status.side_effect = http_error
        mock_client.post.return_value = mock_response

        body = MedicamentDispatchRequest(
            idMedicamento=1, idOrden=10, idPaciente=100, cantidad=5
        )

        with self.assertRaises(HTTPException) as context:
            await self.service.dispatch_medicaments(body)

        self.assertEqual(context.exception.status_code, 500)
        self.assertEqual(context.exception.detail, "Internal Server Error")
        self.inventory_service.dispatch_medicaments.assert_not_called()
        self.movement_service.create_dispatch_event.assert_not_called()


if __name__ == "__main__":
    unittest.main()

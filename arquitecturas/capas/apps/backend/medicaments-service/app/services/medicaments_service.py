from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.schemas.medicament_schema import MedicamentResponse, MedicamentDispatchRequest
from app.services.inventory_service import InventoryService
from app.services.movement_service import MovementService
from app.core.config import settings
import httpx


class MedicamentsService:
    def __init__(self, repository: MedicamentsRepository, inventory_service: InventoryService, movement_service: MovementService):
        self.repository = repository
        self.inventory_service = inventory_service
        self.movement_service = movement_service

    def get_all_medicaments(self) -> list[MedicamentResponse]:

        medicaments = self.repository.get_all()

        return [
            {
                "id": m.id,
                "nombre": m.nombre,
                "inventario": m.inventario.total,
                "movimientos": m.movimientos
            }
            for m in medicaments
        ]

    async def dispatch_medicaments(self, body: MedicamentDispatchRequest):
        # validar orden con servicio de ordenes
        data = {"idPaciente": body.idPaciente, "idOrden": body.idOrden}

        try:
            async with httpx.AsyncClient() as client:
                url_validacion = f"{settings.backend_url}/api/orders/validate"
                response = await client.post(url_validacion, json=data, timeout=5.0)

            response.raise_for_status()

        except httpx.TimeoutException:
            raise Exception("El servicio de órdenes no respondió a tiempo")

        except httpx.ConnectError:
            raise Exception("No se pudo conectar al servicio de órdenes")

        except httpx.HTTPStatusError as e:
            try:
                print(f"Error validation order -> {e.response.json()}")
                error_message = e.response.json().get("message", "Error validando la orden")
            except Exception:
                error_message = e.response.text or "Error validando la orden"

            raise HTTPException(
                status_code=e.response.status_code, detail=error_message)

        medicament_id, quantity = body.idMedicamento, body.cantidad

        self.inventory_service.dispatch_medicaments(
            medicament_id, quantity)

        self.movement_service.create_dispatch_event(
            medicament_id, quantity, "admin")

        return {"message": "Medicamento despachado con éxito"}

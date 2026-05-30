from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.schemas.medicament_schema import MedicamentResponse, MedicamentDispatchRequest, MedicamentUpdateRequest, MedicamentCreateRequest
from app.services.inventory_service import InventoryService
from app.services.movement_service import MovementService
from app.core.constants import MovementType, ErrorMessages
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
                "cantidad": m.cantidad,
                "presentacion": m.presentacion,
                "concentracion": m.concentracion,
                "inventario": {
                    "total": m.inventario.total if m.inventario else 0
                } if m.inventario is not None else None,
                "movimientos": [
                    {
                        "id": movimiento.id,
                        "tipo_movimiento": movimiento.tipo_movimiento,
                        "cantidad": movimiento.cantidad,
                        "id_orden": movimiento.id_orden,
                        "created_at": movimiento.created_at,
                    }
                    for movimiento in m.movimientos
                ],
            }
            for m in medicaments
        ]
    
    def update_medicament(self, id: int, body: MedicamentUpdateRequest):
        medicament = self.repository.update(id, body.nombre)
        if not medicament:
            raise HTTPException(status_code=404, detail="Medicamento no encontrado")
        return {
            "id": medicament.id,
            "nombre": medicament.nombre,
            "inventario": medicament.inventario.total,
            "movimientos": medicament.movimientos
        }

    def create_medicament(self, body: MedicamentCreateRequest):
        medicament = self.repository.create(body.nombre, body.inventario_inicial)
        return {
            "id": medicament.id,
            "nombre": medicament.nombre,
            "inventario": medicament.inventario.total,
            "movimientos": medicament.movimientos
        }

    async def dispatch_medicaments(self, body: MedicamentDispatchRequest):
        # validar orden con servicio de ordenes
        data = {"idPaciente": body.idPaciente, "idOrden": body.idOrden,
                "idMedicamento": body.idMedicamento}

        print(f"data -> {body.idMedicamento}")

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
            medicament_id, body.idOrden, quantity, "admin")

        return {"message": "Medicamento despachado con éxito"}
        
    def update_inventory(self, medicament_id: int, body):
        inventory = self.inventory_service.repository.get_by_id(medicament_id)
        if not inventory:
            raise HTTPException(status_code=404, detail=ErrorMessages.MEDICAMENT_NOT_FOUND)
        
        diferencia = body.total - inventory.total

        if diferencia == 0:
            return {"message": "Sin cambios en el inventario"}

        self.inventory_service.update_inventory(medicament_id, body.total)

        if diferencia > 0:
            self.movement_service.create_adjustment_event(
                medicament_id, diferencia, MovementType.ENTRY, "admin"
            )
        else:
            self.movement_service.create_adjustment_event(
                medicament_id, abs(diferencia), MovementType.EXIT, "admin"
            )

        return {"message": "Inventario actualizado con éxito"}
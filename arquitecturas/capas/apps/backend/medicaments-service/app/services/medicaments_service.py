from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.medicament_schema import MedicamentResponse, MedicamentDispatchRequest
from app.services.inventory_service import InventoryService
from app.services.movement_service import MovementService


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

    def dispatch_medicaments(self, body: MedicamentDispatchRequest):
        self.inventory_service.dispatch_medicaments(
            body.medicament_id, body.quantity)
        self.movement_service.create_dispatch_event(
            body.medicament_id, body.quantity, "admin")
        return {"message": "Medicamento despachado con éxito"}

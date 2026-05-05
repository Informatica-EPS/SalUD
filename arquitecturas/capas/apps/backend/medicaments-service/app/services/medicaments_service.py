from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.medicament_schema import MedicamentResponse, MedicamentDispatchRequest
from app.services.inventory_service import InventoryService


class MedicamentsService:
    def __init__(self, repository: MedicamentsRepository, inventory_service: InventoryService):
        self.repository = repository
        self.inventory_service = inventory_service

    def get_all_medicaments(self) -> list[MedicamentResponse]:
        medicaments = self.repository.get_all()
        # return [MedicamentResponse.model_validate(medicament) for medicament in medicaments]
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
        return self.inventory_service.dispatch_medicaments(
            body.medicament_id, body.quantity)

from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.schemas.medicament_schema import MedicamentResponse


class MovementService:
    def __init__(self, repository: MedicamentsRepository):
        self.repository = repository

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

    def dispatch_medicaments(self) -> MedicamentResponse:
        return {
            "id": "m.id",
            "nombre": "m.nombre",
            "inventario": "m.inventario.total",
            "movimientos": "m.movimientos"
        }

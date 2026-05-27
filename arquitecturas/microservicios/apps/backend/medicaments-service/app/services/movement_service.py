from fastapi import HTTPException
from app.repositories.movement_repository import MovementRepository
from app.core.constants import MovementType, ErrorMessages


class MovementService:
    def __init__(self, repository: MovementRepository):
        self.repository = repository

    def create_dispatch_event(self, id_medicamento: int, cantidad: int, created_by: str):
        event = {
            "id_medicamento": id_medicamento,
            "tipo_movimiento": MovementType.DISPATCH,
            "cantidad": cantidad,
            "created_by": created_by
        }
        return self.repository.create(event)

    def create_entry_event(self, id_medicamento: int, cantidad: int, created_by: str):
            event = {
                "id_medicamento": id_medicamento,
                "tipo_movimiento": MovementType.ENTRY,
                "cantidad": cantidad,
                "created_by": created_by
            }
            return self.repository.create(event)

    def create_adjustment_event(self, id_medicamento: int, cantidad: int, tipo: str, created_by: str):
        event = {
            "id_medicamento": id_medicamento,
            "tipo_movimiento": tipo,
            "cantidad": cantidad,
            "created_by": created_by
        }
        return self.repository.create(event)

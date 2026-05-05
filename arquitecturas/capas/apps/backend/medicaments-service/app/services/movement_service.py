from fastapi import HTTPException
from app.repositories.movement_repository import MovementRepository
from app.core.constants import MovementType


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

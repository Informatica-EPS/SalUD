from fastapi import HTTPException
from app.repositories.inventory_repository import InventoryRepository
from app.core.constants import ErrorMessages


class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self.repository = repository

    def dispatch_medicaments(self, medicament_id: int, quantity: int):
        medicament_inventory = self.repository.get_by_id(medicament_id)

        if not medicament_inventory:
            raise HTTPException(
                status_code=404, detail=ErrorMessages.MEDICAMENT_NOT_FOUND)
        if medicament_inventory.total < quantity:
            raise HTTPException(
                status_code=400, detail=ErrorMessages.INSUFFICIENT_INVENTORY)

        # print(f"inventario ->: {medicament_inventory.total}")

        medicament_inventory.total -= quantity
        self.repository.update(medicament_inventory)

        return {"message": "Medicamento despachado con éxito"}

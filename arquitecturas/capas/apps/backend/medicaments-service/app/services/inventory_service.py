from fastapi import HTTPException
from app.repositories.inventory_repository import InventoryRepository


class InventoryService:
    def __init__(self, repository: InventoryRepository):
        self.repository = repository

    def dispatch_medicaments(self, medicament_id: int, quantity: int):
        medicament_inventory = self.repository.get_by_id(medicament_id)

        if not medicament_inventory:
            raise HTTPException(
                status_code=404, detail="Medicamento no encontrado")
        if medicament_inventory.total < quantity:
            raise HTTPException(
                status_code=400, detail="Inventario insuficiente")

        print(f"inventario ->: {medicament_inventory.total}")

        medicament_inventory.total -= quantity
        self.repository.update(medicament_inventory)

        return {"message": "Medicamento despachado con éxito"}

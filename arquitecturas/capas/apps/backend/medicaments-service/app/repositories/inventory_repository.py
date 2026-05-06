from sqlalchemy.orm import Session, joinedload
from app.models.inventory_model import Inventory


class InventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Inventory | None:
        return self.db.query(Inventory).filter(Inventory.id == id).first()

    def update(self, inventory: Inventory) -> Inventory:
        self.db.commit()
        self.db.refresh(inventory)
        return inventory

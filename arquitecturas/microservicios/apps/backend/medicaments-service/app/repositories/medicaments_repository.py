from sqlalchemy.orm import Session, joinedload
from app.models.medicament_model import Medicament
from app.models.inventory_model import Inventory


class MedicamentsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Medicament | None:
        return self.db.query(Medicament).filter(Medicament.id == id).first()

    def create(self, data: dict) -> Medicament:
        medicament = Medicament(**data)
        self.db.add(medicament)
        self.db.commit()
        self.db.refresh(medicament)
        return medicament

    def get_all(self) -> list[Medicament]:
        return self.db.query(Medicament).options(joinedload(Medicament.inventario), joinedload(Medicament.movimientos)).all()

    def update(self, id: int, nombre: str) -> Medicament | None:
        medicament = self.get_by_id(id)
        if not medicament:
            return None
        medicament.nombre = nombre
        self.db.commit()
        self.db.refresh(medicament)
        return medicament

    def create(self, nombre: str, inventario_inicial: int) -> Medicament:
        medicament = Medicament(nombre=nombre)
        self.db.add(medicament)
        self.db.flush()
        
        inventory = Inventory(id=medicament.id, total=inventario_inicial)
        self.db.add(inventory)
        self.db.commit()
        self.db.refresh(medicament)
        return medicament
from sqlalchemy.orm import Session, joinedload
from app.models.medicament_model import Medicament


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

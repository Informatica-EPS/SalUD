from sqlalchemy.orm import Session, joinedload
from app.models.movement_model import Movement


class MovementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Movement | None:
        return self.db.query(Movement).filter(Movement.id == id).first()

    def create(self, name: str, description: str) -> Movement:
        movement = Movement(name=name, description=description)
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return movement

    def get_all(self) -> list[Movement]:
        return self.db.query(Movement).options(joinedload(Movement.inventario), joinedload(Movement.movimientos)).all()

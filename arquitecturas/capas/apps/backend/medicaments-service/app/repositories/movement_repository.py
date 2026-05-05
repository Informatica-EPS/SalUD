from sqlalchemy.orm import Session, joinedload
from app.models.movement_model import Movement


class MovementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Movement | None:
        return self.db.query(Movement).filter(Movement.id == id).first()

    def create(self, data: dict) -> Movement:
        movement = Movement(**data)
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return movement

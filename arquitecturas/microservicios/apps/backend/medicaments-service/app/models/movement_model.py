from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.core.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship


class Movement(Base):
  __tablename__ = "movimientos"

  id = Column(Integer, primary_key=True, index=True)
  id_medicamento = Column(Integer, ForeignKey("medicamentos.id"), index=True)
  tipo_movimiento = Column(String, nullable=False)
  cantidad = Column(Integer, nullable=False)
  created_by = Column(String, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(
      timezone.utc), nullable=False)

  medicamento = relationship("Medicament", back_populates="movimientos")

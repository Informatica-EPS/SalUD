from datetime import datetime, timezone

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Movement(Base):
  __tablename__ = "movimientos"

  id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
  id_medicamento = Column(BigInteger, ForeignKey("medicamentos.id"), index=True)
  tipo_movimiento = Column(String(20), nullable=False)
  cantidad = Column(Integer, nullable=False)
  id_orden = Column(BigInteger)
  created_by = Column("creado_por", String(100), nullable=False)
  created_at = Column(
      "fecha_creacion",
      DateTime(timezone=True),
      default=lambda: datetime.now(timezone.utc),
      nullable=False,
  )

  medicamento = relationship("Medicament", back_populates="movimientos")

from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship


class Inventory(Base):
  __tablename__ = "inventario"

  id = Column(Integer, ForeignKey("medicamentos.id"),
              primary_key=True)
  total = Column(Integer, nullable=False)

  medicamento = relationship(
      "Medicament", back_populates="inventario", uselist=False)

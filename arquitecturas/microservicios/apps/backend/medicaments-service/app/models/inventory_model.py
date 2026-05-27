from sqlalchemy import BigInteger, Column, ForeignKey, Integer
from app.core.database import Base
from sqlalchemy.orm import relationship


class Inventory(Base):
  __tablename__ = "inventario"

  id = Column("id_medicamento", BigInteger, ForeignKey("medicamentos.id"), primary_key=True)
  total = Column(Integer, nullable=False, default=0)

  medicamento = relationship("Medicament", back_populates="inventario", uselist=False)

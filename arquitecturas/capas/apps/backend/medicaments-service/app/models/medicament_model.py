from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Medicament(Base):
  __tablename__ = "medicamentos"

  id = Column(Integer, primary_key=True, index=True)
  nombre = Column(String, nullable=False)
  
  movimientos = relationship("Movement", back_populates="medicamento")
  inventario = relationship("Inventory", back_populates="medicamento")

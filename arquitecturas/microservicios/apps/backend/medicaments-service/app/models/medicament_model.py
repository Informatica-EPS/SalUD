from sqlalchemy import BigInteger, Column, DateTime, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Medicament(Base):
  __tablename__ = "medicamentos"

  id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
  nombre = Column(String(20), nullable=False)
  cantidad = Column(String(20), nullable=False)
  presentacion = Column(String(20), nullable=False)
  concentracion = Column(String(20), nullable=False)
  fechaCreacion = Column("fecha_creacion", DateTime(timezone=True))
  creadoPor = Column("creado_por", String(100))
  ultimaActualizacion = Column("ultima_actualizacion", DateTime(timezone=True))
  actualizadoPor = Column("actualizado_por", String(100))

  movimientos = relationship("Movement", back_populates="medicamento")
  inventario = relationship("Inventory", back_populates="medicamento", uselist=False)

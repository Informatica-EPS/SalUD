from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Medicament(Base):
  __tablename__ = "medicaments"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String, nullable=False)
  description = Column(String, nullable=False)

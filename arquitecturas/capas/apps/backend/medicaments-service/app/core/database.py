from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(settings.database_url, echo=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
  pass


def get_db():
  db = SessionLocal()
  try:
    yield db        # Entrega la sesión al endpoint
  finally:
    db.close()      # Siempre se cierra, incluso si hay error

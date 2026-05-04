from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "postgresql://user:password@localhost/mydb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
  pass


def get_db():
  db = SessionLocal()
  try:
    yield db        # Entrega la sesión al endpoint
  finally:
    db.close()      # Siempre se cierra, incluso si hay error

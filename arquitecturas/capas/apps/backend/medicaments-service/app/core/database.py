from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# 1. CAMBIO AQUÍ: Forzamos una base de datos local SQLite temporal
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# 2. CAMBIO AQUÍ: Usamos la URL de SQLite en lugar de settings.database_url
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=True, 
    connect_args={"check_same_thread": False} # Esto es necesario para SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# engine = create_engine(settings.database_url, echo=True)
# SessionLocal = sessionmaker(bind=engine)


# class Base(DeclarativeBase):
#     pass


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

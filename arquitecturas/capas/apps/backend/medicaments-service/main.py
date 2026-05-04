from fastapi import FastAPI
from app.routers import medicaments_route
from app.core.database import Base, engine

# Base.metadata.create_all(bind=engine)  # Crea las tablas si no existen

app = FastAPI(title="Medicaments Service", version="1.0")
app.include_router(medicaments_route.router, prefix="/api")

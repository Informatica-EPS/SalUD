from fastapi import FastAPI
from app.routers import medicaments_route


app = FastAPI(title="Medicaments Service", version="1.0")
app.include_router(medicaments_route.router, prefix="/api")

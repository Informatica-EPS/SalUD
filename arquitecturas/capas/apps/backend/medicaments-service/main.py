from fastapi import FastAPI
from app.core.error_handler import ErrorHandlerMiddleware
from app.routers import medicaments_route

app = FastAPI(title="Medicaments Service", version="1.0")


app.add_middleware(ErrorHandlerMiddleware)

#app.include_router(medicaments_route.router, prefix="/api")
# despliegue inicial 3

@app.get("/")
def read_root():
    return {"status": "ok", "message": "¡Microservicio en la nube funcionando sin BD!"}
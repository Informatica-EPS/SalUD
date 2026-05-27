from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.core.error_handler import ErrorHandlerMiddleware
from app.routers import medicaments_route

app = FastAPI(title="Medicaments Service", version="1.0")

app.add_middleware(GZipMiddleware)

app.add_middleware(ErrorHandlerMiddleware)

app.include_router(medicaments_route.router, prefix="/api")
# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080",
                   "http://localhost:3000",
                   "http://localhost:8081",
                   "https://blue-rock-0a2badb0f.7.azurestaticapps.net",
                   "http://salud.mexicocentral.cloudapp.azure.com"
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
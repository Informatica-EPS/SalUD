from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.medicaments_repository import MedicamentsRepository
from app.services.medicaments_service import MedicamentsService
from app.services.inventory_service import InventoryService
from app.schemas.medicament_schema import MedicamentDispatchRequest


router = APIRouter(prefix="/medicaments", tags=["Medicaments"])


def get_medicaments_service(db: Session = Depends(get_db)):
    return MedicamentsService(MedicamentsRepository(db), InventoryService(InventoryRepository(db)))


@router.get("/", status_code=status.HTTP_200_OK)
def list_medicaments(service: MedicamentsService = Depends(get_medicaments_service)):
    return service.get_all_medicaments()


@router.post("/dispatch", status_code=status.HTTP_201_CREATED)
def dispatch_medicaments_route(body: MedicamentDispatchRequest, service: MedicamentsService = Depends(get_medicaments_service)):
    return service.dispatch_medicaments(body)

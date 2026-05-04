from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.medicaments_repository import MedicamentsRepository
from app.services.medicaments_service import MedicamentsService
from app.schemas.medicament_schema import MedicamentResponse

router = APIRouter(prefix="/medicaments", tags=["Medicaments"])


def get_medicaments_service(db: Session = Depends(get_db)):
  return MedicamentsService(MedicamentsRepository(db))


@router.get("/", response_model=list[MedicamentResponse], status_code=status.HTTP_200_OK)
def list_medicaments(service: MedicamentsService = Depends(get_medicaments_service)):
  return service.get_all_medicaments()

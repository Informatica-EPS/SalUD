from fastapi import HTTPException
from app.repositories.medicaments_repository import MedicamentsRepository
from app.schemas.medicament_schema import MedicamentResponse

medicaments_mock = [
    {"id": 1, "name": "Paracetamol",
     "description": "Analgésico y antipirético comúnmente utilizado para aliviar el dolor y reducir la fiebre."},
    {"id": 2, "name": "Ibuprofeno",
     "description": "Antiinflamatorio no esteroideo (AINE) utilizado para aliviar el dolor, reducir la inflamación y bajar la fiebre."},
    {"id": 3, "name": "Amoxicilina",
     "description": "Antibiótico de amplio espectro utilizado para tratar diversas infecciones bacterianas."}
]


class MedicamentsService:
  def __init__(self, repository: MedicamentsRepository):
    self.repository = repository

  def get_all_medicaments(self) -> list[MedicamentResponse]:
    return [MedicamentResponse(**medicament) for medicament in medicaments_mock]
    # users = self.repository.get_all()
    # return [UserResponse.model_validate(u) for u in users]

from pydantic import BaseModel, EmailStr


class MedicamentResponse(BaseModel):    # Lo que devuelve el endpoint
  id: int
  name: str
  description: str

  model_config = {"from_attributes": True}  # Permite leer desde ORM

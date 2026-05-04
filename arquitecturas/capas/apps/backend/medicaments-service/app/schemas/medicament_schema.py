from pydantic import BaseModel, EmailStr


class MovementsResponse(BaseModel):
  id: int
  tipo: str
  cantidad: int
  created_at: str

  model_config = {"from_attributes": True}


class InventoryResponse(BaseModel):
  id: int
  total: int

  model_config = {"from_attributes": True}


class MedicamentResponse(BaseModel):    # Lo que devuelve el endpoint
  id: int
  nombre: str
  inventario: InventoryResponse | None = None
  movimientos: list[MovementsResponse] | None = None

  model_config = {"from_attributes": True}  # Permite leer desde ORM

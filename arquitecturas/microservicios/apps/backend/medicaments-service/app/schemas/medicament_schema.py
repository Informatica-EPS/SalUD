from pydantic import BaseModel, EmailStr


class MovementsResponse(BaseModel):
    id: int
    tipo: str
    cantidad: int
    created_at: str

    model_config = {"from_attributes": True}


class InventoryResponse(BaseModel):
    total: int

    model_config = {"from_attributes": True}


class MedicamentResponse(BaseModel):
    id: int
    nombre: str
    inventario: InventoryResponse | None = None
    movimientos: list[MovementsResponse] | None = None

    model_config = {"from_attributes": True}


class MedicamentDispatchRequest(BaseModel):
    idMedicamento: int
    idOrden: int
    idPaciente: int
    cantidad: int

class MedicamentUpdateRequest(BaseModel):
    nombre: str

class MedicamentCreateRequest(BaseModel):
    nombre: str
    inventario_inicial: int = 0

class InventoryUpdateRequest(BaseModel):
    total: int
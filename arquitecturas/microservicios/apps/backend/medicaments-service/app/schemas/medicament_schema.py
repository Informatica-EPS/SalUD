from datetime import datetime

from pydantic import BaseModel


class MovementsResponse(BaseModel):
    id: int
    tipo_movimiento: str
    cantidad: int
    id_orden: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class InventoryResponse(BaseModel):
    total: int

    model_config = {"from_attributes": True}


class MedicamentResponse(BaseModel):
    id: int
    nombre: str
    cantidad: str
    presentacion: str
    concentracion: str
    inventario: InventoryResponse | None = None
    movimientos: list[MovementsResponse] | None = None

    model_config = {"from_attributes": True}


class MedicamentDispatchRequest(BaseModel):
    idMedicamento: int
    idOrden: int
    idPaciente: int
    cantidad: int

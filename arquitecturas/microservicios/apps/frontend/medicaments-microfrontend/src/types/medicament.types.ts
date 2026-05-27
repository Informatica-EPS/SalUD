export interface Movimiento {
  id: number;
  id_medicamento: number;
  cantidad: number;
  tipo_movimiento: 'entrada' | 'salida';
  created_by: string;
  created_at: string;
}

export interface Inventory {
  total: number;
}

export interface Medicament {
  id: number;
  nombre: string;
  inventario?: Inventory;
  movimientos: Movimiento[];
}

export interface MedicamentCreate {
  nombre: string;
  inventario: number;
}

export interface MedicamentUpdate extends Partial<MedicamentCreate> {}

export interface Movimiento {
  id: number;
  id_medicamento: number;
  cantidad: number;
  tipo_movimiento: 'entrada' | 'salida';
  created_by: string;
  created_at: string;
}

export interface Medicament {
  id: number;
  nombre: string;
  inventario: number;
  movimientos: Movimiento[];
}

export interface MedicamentCreate {
  nombre: string;
  inventario: number;
}

// Tipos para ordenes del paciente
export interface OrdenMedicamento {
  id: number;
  idMedicamento: number;
  estado: string;
  descripcion: string;
  fechaVencimiento: string;
  cantidad_medicamento: number;
  Appointment: {
    tipoCita: string;
    estado: string;
    TimeSlot: {
      fecha: string;
      horaInicio: string;
      horaFin: string;
    };
    Patient: {
      User: {
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
      };
    };
  };
}

export interface OrdenesResponse {
  success: boolean;
  message: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    ordenes: OrdenMedicamento[];
  };
}

export interface DispatchRequest {
  idMedicamento: number;
  idOrden: number;
  idPaciente: number;
  cantidad: number;
}

export interface MedicamentUpdate extends Partial<MedicamentCreate> {}

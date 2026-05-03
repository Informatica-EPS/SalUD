export interface IMedico {
   id: number;
   nombre: string;
   apellido: string;
   especialidad: string;
   email: string;
   telefono: string;
}

export interface ICitaMedica {
   id: number;
   paciente: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
   };
   medico: IMedico;
   fecha: string;
   hora: string;
   motivo: string;
   estado: 'programada' | 'completada' | 'cancelada' | 'en_proceso';
   consultorio: string;
}

export interface ICitaDisponible {
   id: number;
   medico: IMedico;
   fecha: string;
   horaInicio: string;
   horaFin: string;
   disponible: boolean;
}

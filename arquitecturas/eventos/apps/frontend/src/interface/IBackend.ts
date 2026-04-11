// ============================================
// INTERFACES PARA ENTIDADES DEL BACKEND
// ============================================

// Usuario
export interface IUser {
   id: number;
   tipo_documento?: string;
   documento?: string;
   primer_nombre?: string;
   segundo_nombre?: string;
   primer_apellido?: string;
   segundo_apellido?: string;
   fecha_nacimiento?: string;
   lugar_nacimiento?: string;
   direccion?: string;
   usuario?: string;
   email?: string;
   password?: string;
   creado_por?: string;
   fecha_creacion?: string;
   ultima_actualizacion?: string;
   actualizado_por?: string;
   // Campos en camelCase para compatibilidad con código existente
   tipoIdentificacion?: string;
   numeroIdentificacion?: string;
   primerNombre?: string;
   segundoNombre?: string;
   primerApellido?: string;
   segundoApellido?: string;
   fechaNacimiento?: string;
   telefono?: string;
   correo?: string;
   contrasena?: string;
   idRol?: number;
   creadoPor?: number;
   actualizadoPor?: number;
   createdAt?: string;
   updatedAt?: string;
   rol?: IRole;
   roles?: string[];
   idPaciente?: number;
   idDoctor?: number;
}

// Rol
export interface IRole {
   id: number;
   nombre: string;
   descripcion?: string;
   creadoPor: number;
   actualizadoPor: number;
   createdAt?: string;
   updatedAt?: string;
}

// Paciente
export interface IPatient {
   id: number;
   ocupacion: string;
   discapacidad: string;
   religion: string;
   etnicidad: string;
   identidadGenero: string;
   sexo: 'M' | 'F' | 'O';
   idUsuario: number;
   creadoPor: number;
   actualizadoPor: number;
   createdAt?: string;
   updatedAt?: string;
   usuario?: IUser;
   User?: IUser; // Sequelize devuelve el modelo asociado con este nombre
}

// Doctor
export interface IDoctor {
   id: number;
   licenciaMedica: string;
   idUsuario: number;
   creadoPor: number;
   actualizadoPor: number;
   createdAt?: string;
   updatedAt?: string;
   usuario?: IUser;
   User?: IUser; // Sequelize devuelve el modelo asociado con este nombre
}

// TimeSlot (Horario)
export interface ITimeSlot {
   id: number;
   fecha: string;
   horaInicio: string;
   horaFin: string;
   estado: 'disponible' | 'programado' | 'completado' | 'cancelado';
   idDoctor: number;
   creadoPor: number;
   actualizadoPor: number;
   createdAt?: string;
   updatedAt?: string;
   doctor?: IDoctor;
   Doctor?: IDoctor; // Sequelize devuelve el modelo asociado con este nombre
}

// Appointment (Cita)
export interface IAppointment {
   id: number;
   tipoCita: string;
   estado: 'programada' | 'completada' | 'completado' | 'cancelada' | 'cancelado' | 'en_proceso';
   idPaciente: number;
   idDoctor: number;
   idHorario: number;
   creadoPor: number;
   actualizadoPor: number;
   createdAt?: string;
   updatedAt?: string;
   paciente?: IPatient;
   doctor?: IDoctor;
   horario?: ITimeSlot;
   detalles?: IAppointmentDetail;
   // Sequelize devuelve los modelos asociados con estos nombres
   Paciente?: IPatient;
   Doctor?: IDoctor;
   TimeSlot?: ITimeSlot;
   AppointmentDetail?: IAppointmentDetail;
}

// AppointmentDetail (Detalle de Cita)
export interface IAppointmentDetail {
   id: number;
   motivo: string;
   antecedentes?: string;
   anamnesis?: string;
   revisionSistemas?: string;
   examenFisico?: string;
   diagnostico?: string;
   planManejo?: string;
   evolucion?: string;
   idCita: number;
   creadoPor?: number;
   actualizadoPor?: number;
   createdAt?: string;
   updatedAt?: string;
   cita?: IAppointment;
}

// ============================================
// INTERFACES PARA REQUESTS
// ============================================

// Request para crear paciente
export interface ICreatePatientRequest {
   ocupacion: string;
   discapacidad: string;
   religion: string;
   etnicidad: string;
   identidadGenero: string;
   sexo: 'M' | 'F' | 'O';
   idUsuario: number;
   creadoPor: number;
   actualizadoPor: number;
}

// Request para crear doctor
export interface ICreateDoctorRequest {
   licenciaMedica: string;
   idUsuario: number;
   creadoPor: number;
   actualizadoPor: number;
}

// Request para crear TimeSlot
export interface ICreateTimeSlotRequest {
   fecha: string;
   horaInicio: string;
   horaFin: string;
   estado: 'disponible' | 'programado' | 'completado' | 'cancelado';
   idDoctor: number;
   creadoPor: number;
   actualizadoPor: number;
}

// Request para crear TimeSlots en lote
export interface ICreateBatchTimeSlotsRequest {
   slots: ICreateTimeSlotRequest[];
}

// Request para crear Appointment
export interface ICreateAppointmentRequest {
   tipoCita: string;
   estado: 'programada' | 'completada' | 'completado' | 'cancelada' | 'cancelado' | 'en_proceso';
   idPaciente: number;
   idDoctor: number;
   idHorario: number;
   creadoPor: number;
   actualizadoPor: number;
}

// Request para reprogramar Appointment
export interface IRescheduleAppointmentRequest {
   tipoCita: string;
   estado: 'programada' | 'completada' | 'completado' | 'cancelada' | 'cancelado' | 'en_proceso';
   idPaciente: number;
   idDoctor: number;
   idHorario: number;
   creadoPor: number;
   actualizadoPor: number;
}

// Request para crear AppointmentDetail
export interface ICreateAppointmentDetailRequest {
   motivo: string;
   antecedentes?: string;
   anamnesis?: string;
   revisionSistemas?: string;
   examenFisico?: string;
   diagnostico?: string;
   planManejo?: string;
   evolucion?: string;
   idCita: number;
   creadoPor?: number;
   actualizadoPor?: number;
}

// ============================================
// INTERFACES PARA RESPONSES
// ============================================

// Response con paginación
export interface IPaginatedResponse<T> {
   data: T[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
}

// Response genérica de API
export interface IApiResponse<T> {
   success: boolean;
   data: T;
   message?: string;
   error?: string;
}

// Response de historia clínica
export interface IClinicalHistoryResponse {
   paciente: IPatient;
   citas: IAppointment[];
}

// ============================================
// INTERFACES PARA ÓRDENES MÉDICAS
// ============================================

// Orden
export interface IOrder {
   id: number;
   idCita: number;
   fechaVencimiento?: string;
   estado: 'pendiente' | 'programada' | 'ejecutada' | 'cancelada';
   entidadDestino: string;
   especialidad: string;
   descripcion: string;
   creadoPor?: number;
   actualizadoPor?: number;
   createdAt?: string;
   updatedAt?: string;
   cita?: IAppointment;
   Appointment?: IAppointment;
}

// Request para crear Orden
export interface ICreateOrderRequest {
   idCita: number;
   fechaVencimiento?: string;
   estado: 'pendiente' | 'programada' | 'ejecutada' | 'cancelada';
   entidadDestino: string;
   especialidad: string;
   descripcion: string;
   creadoPor?: number;
   actualizadoPor?: number;
}

// Request para actualizar Orden
export interface IUpdateOrderRequest {
   idCita?: number;
   fechaVencimiento?: string;
   estado?: 'pendiente' | 'programada' | 'ejecutada' | 'cancelada';
   entidadDestino?: string;
   especialidad?: string;
   descripcion?: string;
   actualizadoPor?: number;
}

// Response de lista de órdenes con paginación
export interface IOrdersResponse {
   totalPages: number;
   totalItems: number;
   currentPage: number;
   ordenes: IOrder[];
}

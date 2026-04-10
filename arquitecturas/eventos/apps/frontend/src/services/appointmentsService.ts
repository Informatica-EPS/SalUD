import { api } from './apiClient';
import { 
   IAppointment, 
   ICreateAppointmentRequest, 
   IRescheduleAppointmentRequest,
   IPaginatedResponse,
   IClinicalHistoryResponse 
} from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con Appointments (Citas Médicas)
 */
export const appointmentsService = {
   /**
    * Obtener todas las citas
    * GET /api/appointments
    */
   getAll: async (): Promise<IAppointment[]> => {
      try {
         const response = await api.get<IAppointment[]>('/appointments');
         return response;
      } catch (error) {
         console.error('Error al obtener citas:', error);
         throw error;
      }
   },

   /**
    * Obtener una cita por ID
    * GET /api/appointments/:id
    */
   getById: async (id: number): Promise<IAppointment> => {
      try {
         const response = await api.get<IAppointment>(`/appointments/${id}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Obtener citas por doctor
    * GET /api/appointments/doctor/:doctorId
    */
   getByDoctor: async (doctorId: number): Promise<IAppointment[]> => {
      try {
         const response = await api.get<IAppointment[]>(`/appointments/doctor/${doctorId}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener citas del doctor ${doctorId}:`, error);
         throw error;
      }
   },

   /**
    * Obtener citas por paciente con paginación
    * GET /api/appointments/paciente/:patientId?page=1&limit=10
    */
   getByPatient: async (
      patientId: number, 
      page: number = 1, 
      limit: number = 10
   ): Promise<IPaginatedResponse<IAppointment>> => {
      try {
         const response = await api.get<IPaginatedResponse<IAppointment>>(
            `/appointments/paciente/${patientId}?page=${page}&limit=${limit}`
         );
         return response;
      } catch (error) {
         console.error(`Error al obtener citas del paciente ${patientId}:`, error);
         throw error;
      }
   },

   /**
    * Obtener historia clínica de un paciente
    * GET /api/appointments/clinical-records/:patientId
    */
   getClinicalHistory: async (patientId: number): Promise<IClinicalHistoryResponse> => {
      try {
         const response = await api.get<IClinicalHistoryResponse>(
            `/appointments/clinical-records/${patientId}`
         );
         return response;
      } catch (error) {
         console.error(`Error al obtener historia clínica del paciente ${patientId}:`, error);
         throw error;
      }
   },

   /**
    * Obtener registros médicos de un paciente (alias de clinical history)
    * GET /api/appointments/medical-records/:patientId
    */
   getMedicalRecords: async (patientId: number): Promise<IClinicalHistoryResponse> => {
      try {
         const response = await api.get<IClinicalHistoryResponse>(
            `/appointments/medical-records/${patientId}`
         );
         return response;
      } catch (error) {
         console.error(`Error al obtener registros médicos del paciente ${patientId}:`, error);
         throw error;
      }
   },

   /**
    * Crear una nueva cita
    * POST /api/appointments
    */
   create: async (data: ICreateAppointmentRequest): Promise<IAppointment> => {
      try {
         const response = await api.post<IAppointment>('/appointments', data);
         console.log('✅ Cita creada exitosamente');
         return response;
      } catch (error) {
         console.error('Error al crear cita:', error);
         throw error;
      }
   },

   /**
    * Reprogramar una cita existente
    * PUT /api/appointments/reschedule/:id
    */
   reschedule: async (
      id: number, 
      data: IRescheduleAppointmentRequest
   ): Promise<IAppointment> => {
      try {
         const response = await api.put<IAppointment>(`/appointments/reschedule/${id}`, data);
         console.log(`✅ Cita ${id} reprogramada exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al reprogramar cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Cancelar una cita
    * PUT /api/appointments/cancel/:id
    */
   cancel: async (id: number, data: Partial<ICreateAppointmentRequest>): Promise<IAppointment> => {
      try {
         const response = await api.put<IAppointment>(`/appointments/cancel/${id}`, data);
         console.log(`✅ Cita ${id} cancelada exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al cancelar cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Marcar una cita como completada
    * PUT /api/appointments/complete/:id
    */
   complete: async (id: number, data: Partial<ICreateAppointmentRequest>): Promise<IAppointment> => {
      try {
         const response = await api.put<IAppointment>(`/appointments/complete/${id}`, data);
         console.log(`✅ Cita ${id} completada exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al completar cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Iniciar una cita (marcarla como "en_proceso")
    * PUT /api/appointments/:id
    */
   start: async (id: number, actualizadoPor?: number): Promise<IAppointment> => {
      try {
         const response = await api.put<IAppointment>(`/appointments/${id}`, {
            estado: 'en_proceso',
            actualizadoPor,
         });
         console.log(`✅ Cita ${id} iniciada (en proceso)`);
         return response;
      } catch (error) {
         console.error(`Error al iniciar cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Actualizar una cita existente
    * PUT /api/appointments/:id
    */
   update: async (id: number, data: Partial<ICreateAppointmentRequest>): Promise<IAppointment> => {
      try {
         const response = await api.put<IAppointment>(`/appointments/${id}`, data);
         console.log(`✅ Cita ${id} actualizada exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al actualizar cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Eliminar una cita
    * DELETE /api/appointments/:id
    */
   delete: async (id: number): Promise<void> => {
      try {
         await api.delete(`/appointments/${id}`);
         console.log(`✅ Cita ${id} eliminada exitosamente`);
      } catch (error) {
         console.error(`Error al eliminar cita ${id}:`, error);
         throw error;
      }
   },
};

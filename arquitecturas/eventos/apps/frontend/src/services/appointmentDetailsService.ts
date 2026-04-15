import { api } from './apiClient';
import { IAppointmentDetail, ICreateAppointmentDetailRequest } from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con Appointment Details (Detalles de Citas)
 */
export const appointmentDetailsService = {
   /**
    * Obtener todos los detalles de citas
    * GET /api/appointment-details
    */
   getAll: async (): Promise<IAppointmentDetail[]> => {
      try {
         const response = await api.get<IAppointmentDetail[]>('/appointment-details');
         return response;
      } catch (error) {
         console.error('Error al obtener detalles de citas:', error);
         throw error;
      }
   },

   /**
    * Obtener un detalle de cita por ID
    * GET /api/appointment-details/:id
    */
   getById: async (id: number): Promise<IAppointmentDetail> => {
      try {
         const response = await api.get<IAppointmentDetail>(`/appointment-details/${id}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener detalle de cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Obtener detalles de citas por ID de cita
    * GET /api/appointment-details/appointment/:appointmentId
    */
   getByAppointmentId: async (appointmentId: number): Promise<IAppointmentDetail> => {
      try {
         const response = await api.get<IAppointmentDetail>(
            `/appointment-details/appointment/${appointmentId}`
         );
         return response;
      } catch (error) {
         console.error(`Error al obtener detalle de la cita ${appointmentId}:`, error);
         throw error;
      }
   },

   /**
    * Crear un nuevo detalle de cita
    * POST /api/appointment-details
    */
   create: async (data: ICreateAppointmentDetailRequest): Promise<IAppointmentDetail> => {
      try {
         const response = await api.post<IAppointmentDetail>('/appointment-details', data);
         console.log('✅ Detalle de cita creado exitosamente');
         return response;
      } catch (error) {
         console.error('Error al crear detalle de cita:', error);
         throw error;
      }
   },

   /**
    * Actualizar un detalle de cita existente
    * PUT /api/appointment-details/:id
    */
   update: async (
      id: number, 
      data: Partial<ICreateAppointmentDetailRequest>
   ): Promise<IAppointmentDetail> => {
      try {
         const response = await api.put<IAppointmentDetail>(`/appointment-details/${id}`, data);
         console.log(`✅ Detalle de cita ${id} actualizado exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al actualizar detalle de cita ${id}:`, error);
         throw error;
      }
   },

   /**
    * Eliminar un detalle de cita
    * DELETE /api/appointment-details/:id
    */
   delete: async (id: number): Promise<void> => {
      try {
         await api.delete(`/appointment-details/${id}`);
         console.log(`✅ Detalle de cita ${id} eliminado exitosamente`);
      } catch (error) {
         console.error(`Error al eliminar detalle de cita ${id}:`, error);
         throw error;
      }
   },
};

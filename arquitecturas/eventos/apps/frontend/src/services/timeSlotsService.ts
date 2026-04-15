import { api } from './apiClient';
import { 
   ITimeSlot, 
   ICreateTimeSlotRequest, 
   ICreateBatchTimeSlotsRequest,
   IPaginatedResponse 
} from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con TimeSlots (Horarios)
 */
export const timeSlotsService = {
   /**
    * Obtener todos los time slots con paginación
    * GET /api/time-slots?page=1&limit=10
    */
   getAll: async (page: number = 1, limit: number = 10): Promise<IPaginatedResponse<ITimeSlot>> => {
      try {
         const response = await api.get<IPaginatedResponse<ITimeSlot>>(
            `/time-slots?page=${page}&limit=${limit}`
         );
         return response;
      } catch (error) {
         console.error('Error al obtener horarios:', error);
         throw error;
      }
   },

   /**
    * Obtener un time slot por ID
    * GET /api/time-slots/:id
    */
   getById: async (id: number): Promise<ITimeSlot> => {
      try {
         const response = await api.get<ITimeSlot>(`/time-slots/${id}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener horario ${id}:`, error);
         throw error;
      }
   },

   /**
    * Obtener todos los horarios disponibles con paginación
    * GET /api/time-slots/available?page=1&limit=10
    */
   getAvailable: async (page: number = 1, limit: number = 10): Promise<{
      franjasHorarias: ITimeSlot[];
      totalPages: number;
      totalItems: number;
      currentPage: number;
   }> => {
      try {
         const response: any = await api.get(
            `/time-slots/available?page=${page}&limit=${limit}`
         );
         console.log('Response getAvailable:', response);
         
         // Manejar diferentes estructuras de respuesta
         if (response.franjasHorarias) {
            // Backend actual: { franjasHorarias: [], totalPages, currentPage, totalItems }
            return {
               franjasHorarias: response.franjasHorarias || [],
               totalPages: response.totalPages || 1,
               totalItems: response.totalItems || 0,
               currentPage: response.currentPage || 1,
            };
         } else if (Array.isArray(response)) {
            // Array directo (retrocompatibilidad)
            return {
               franjasHorarias: response,
               totalPages: 1,
               totalItems: response.length,
               currentPage: 1,
            };
         } else {
            // Fallback
            return {
               franjasHorarias: [],
               totalPages: 0,
               totalItems: 0,
               currentPage: 1,
            };
         }
      } catch (error) {
         console.error('Error al obtener horarios disponibles:', error);
         return {
            franjasHorarias: [],
            totalPages: 0,
            totalItems: 0,
            currentPage: 1,
         };
      }
   },

   /**
    * Obtener todos los horarios programados
    * GET /api/time-slots/scheduled
    */
   getScheduled: async (): Promise<ITimeSlot[]> => {
      try {
         const response = await api.get<ITimeSlot[]>('/time-slots/scheduled');
         return response;
      } catch (error) {
         console.error('Error al obtener horarios programados:', error);
         throw error;
      }
   },

   /**
    * Obtener horarios por doctor
    * GET /api/time-slots/doctor/:doctorId?limit=20
    */
   getByDoctor: async (doctorId: number, limit: number = 20): Promise<ITimeSlot[]> => {
      try {
         const response: any = await api.get(
            `/time-slots/doctor/${doctorId}?limit=${limit}`
         );
         
         console.log('Response getByDoctor:', response);
         
         // Manejar diferentes estructuras de respuesta
         if (response.franjasHorarias) {
            // Backend actual: { franjasHorarias: [], totalPages, currentPage, totalItems }
            return response.franjasHorarias || [];
         } else if (Array.isArray(response)) {
            // Array directo
            return response;
         } else {
            // Fallback
            return [];
         }
      } catch (error) {
         console.error(`Error al obtener horarios del doctor ${doctorId}:`, error);
         return []; // Retornar array vacío en caso de error
      }
   },

   /**
    * Obtener horarios disponibles por doctor
    * GET /api/time-slots/doctor/available/:doctorId
    */
   getAvailableByDoctor: async (doctorId: number): Promise<ITimeSlot[]> => {
      try {
         const response: any = await api.get(
            `/time-slots/doctor/available/${doctorId}`
         );
         
         console.log('Response getAvailableByDoctor:', response);
         
         // Manejar diferentes estructuras de respuesta
         if (response.franjasHorarias) {
            // Backend actual: { franjasHorarias: [], totalPages, currentPage, totalItems }
            return response.franjasHorarias || [];
         } else if (Array.isArray(response)) {
            // Array directo
            return response;
         } else {
            // Fallback
            return [];
         }
      } catch (error) {
         console.error(`Error al obtener horarios disponibles del doctor ${doctorId}:`, error);
         return []; // Retornar array vacío en caso de error
      }
   },

   /**
    * Crear un nuevo time slot
    * POST /api/time-slots
    */
   create: async (data: ICreateTimeSlotRequest): Promise<ITimeSlot> => {
      try {
         const response = await api.post<ITimeSlot>('/time-slots', data);
         console.log('✅ Horario creado exitosamente');
         return response;
      } catch (error) {
         console.error('Error al crear horario:', error);
         throw error;
      }
   },

   /**
    * Crear múltiples time slots en lote
    * POST /api/time-slots (con body que contiene array de slots)
    */
   createBatch: async (data: ICreateBatchTimeSlotsRequest): Promise<ITimeSlot[]> => {
      try {
         const response = await api.post<ITimeSlot[]>('/time-slots', data);
         console.log(`✅ ${data.slots.length} horarios creados exitosamente`);
         return response;
      } catch (error) {
         console.error('Error al crear horarios en lote:', error);
         throw error;
      }
   },

   /**
    * Actualizar un time slot existente
    * PUT /api/time-slots/:id
    */
   update: async (id: number, data: Partial<ICreateTimeSlotRequest>): Promise<ITimeSlot> => {
      try {
         const response = await api.put<ITimeSlot>(`/time-slots/${id}`, data);
         console.log(`✅ Horario ${id} actualizado exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al actualizar horario ${id}:`, error);
         throw error;
      }
   },

   /**
    * Eliminar un time slot
    * DELETE /api/time-slots/:id
    */
   delete: async (id: number): Promise<void> => {
      try {
         await api.delete(`/time-slots/${id}`);
         console.log(`✅ Horario ${id} eliminado exitosamente`);
      } catch (error) {
         console.error(`Error al eliminar horario ${id}:`, error);
         throw error;
      }
   },
};

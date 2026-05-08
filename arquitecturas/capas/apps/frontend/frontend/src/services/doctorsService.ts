import { api } from './apiClient';
import { IDoctor, ICreateDoctorRequest } from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con Doctores
 */
export const doctorsService = {
   /**
    * Obtener todos los doctores
    * GET /api/doctors
    */
   getAll: async (): Promise<IDoctor[]> => {
      try {
         const response = await api.get<IDoctor[]>('/doctors');
         return response;
      } catch (error) {
         console.error('Error al obtener doctores:', error);
         throw error;
      }
   },

   /**
    * Obtener un doctor por ID
    * GET /api/doctors/:id
    */
   getById: async (id: number): Promise<IDoctor> => {
      try {
         const response = await api.get<IDoctor>(`/doctors/${id}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener doctor ${id}:`, error);
         throw error;
      }
   },

   /**
    * Crear un nuevo doctor
    * POST /api/doctors
    */
   create: async (data: ICreateDoctorRequest): Promise<IDoctor> => {
      try {
         const response = await api.post<IDoctor>('/doctors', data);
         console.log('✅ Doctor creado exitosamente');
         return response;
      } catch (error) {
         console.error('Error al crear doctor:', error);
         throw error;
      }
   },

   /**
    * Actualizar un doctor existente
    * PUT /api/doctors/:id
    */
   update: async (id: number, data: Partial<ICreateDoctorRequest>): Promise<IDoctor> => {
      try {
         const response = await api.put<IDoctor>(`/doctors/${id}`, data);
         console.log(`✅ Doctor ${id} actualizado exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al actualizar doctor ${id}:`, error);
         throw error;
      }
   },

   /**
    * Eliminar un doctor
    * DELETE /api/doctors/:id
    */
   delete: async (id: number): Promise<void> => {
      try {
         await api.delete(`/doctors/${id}`);
         console.log(`✅ Doctor ${id} eliminado exitosamente`);
      } catch (error) {
         console.error(`Error al eliminar doctor ${id}:`, error);
         throw error;
      }
   },
};

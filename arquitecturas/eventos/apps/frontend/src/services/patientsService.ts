import { api } from './apiClient';
import { IPatient, ICreatePatientRequest } from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con Pacientes
 */
export const patientsService = {
   /**
    * Obtener todos los pacientes
    * GET /api/patients
    */
   getAll: async (): Promise<IPatient[]> => {
      try {
         const response = await api.get<IPatient[]>('/patients');
         return response;
      } catch (error) {
         console.error('Error al obtener pacientes:', error);
         throw error;
      }
   },

   /**
    * Obtener un paciente por ID
    * GET /api/patients/:id
    */
   getById: async (id: number): Promise<IPatient> => {
      try {
         const response = await api.get<IPatient>(`/patients/${id}`);
         return response;
      } catch (error) {
         console.error(`Error al obtener paciente ${id}:`, error);
         throw error;
      }
   },

   /**
    * Crear un nuevo paciente
    * POST /api/patients
    */
   create: async (data: ICreatePatientRequest): Promise<IPatient> => {
      try {
         const response = await api.post<IPatient>('/patients', data);
         console.log('✅ Paciente creado exitosamente');
         return response;
      } catch (error) {
         console.error('Error al crear paciente:', error);
         throw error;
      }
   },

   /**
    * Actualizar un paciente existente
    * PUT /api/patients/:id
    */
   update: async (id: number, data: Partial<ICreatePatientRequest>): Promise<IPatient> => {
      try {
         const response = await api.put<IPatient>(`/patients/${id}`, data);
         console.log(`✅ Paciente ${id} actualizado exitosamente`);
         return response;
      } catch (error) {
         console.error(`Error al actualizar paciente ${id}:`, error);
         throw error;
      }
   },

   /**
    * Eliminar un paciente
    * DELETE /api/patients/:id
    */
   delete: async (id: number): Promise<void> => {
      try {
         await api.delete(`/patients/${id}`);
         console.log(`✅ Paciente ${id} eliminado exitosamente`);
      } catch (error) {
         console.error(`Error al eliminar paciente ${id}:`, error);
         throw error;
      }
   },
};

import { api } from './apiClient';
import { ISpecialty } from '../interface';

/**
 * Servicio para manejar operaciones relacionadas con Especialidades
 */
export const specialtiesService = {
   /**
    * Obtener todas las especialidades
    * GET /api/specialties
    */
   getAll: async (): Promise<ISpecialty[]> => {
      try {
         const response = await api.get<ISpecialty[]>('/specialties');
         return response;
      } catch (error) {
         console.error('Error al obtener especialidades:', error);
         throw error;
      }
   },
};
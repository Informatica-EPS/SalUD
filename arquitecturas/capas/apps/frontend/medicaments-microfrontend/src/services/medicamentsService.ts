import axios from 'axios';
import { Medicament, MedicamentCreate, MedicamentUpdate } from '../types/medicament.types';

const API_BASE_URL = import.meta.env.VITE_MEDICAMENTS_API_URL || 'http://localhost:5010/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const medicamentsService = {
  // Obtener todos los medicamentos
  getAll: async (): Promise<Medicament[]> => {
    const response = await apiClient.get<Medicament[]>('/medicaments');
    return response.data;
  },

  // Obtener un medicamento por ID
  getById: async (id: number): Promise<Medicament> => {
    const response = await apiClient.get<Medicament>(`/medicaments/${id}`);
    return response.data;
  },

  // Crear un nuevo medicamento
  create: async (medicament: MedicamentCreate): Promise<Medicament> => {
    const response = await apiClient.post<Medicament>('/medicaments', medicament);
    return response.data;
  },

  // Actualizar un medicamento
  update: async (id: number, medicament: MedicamentUpdate): Promise<Medicament> => {
    const response = await apiClient.put<Medicament>(`/medicaments/${id}`, medicament);
    return response.data;
  },

  // Eliminar un medicamento
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/medicaments/${id}`);
  },

  // Buscar medicamentos por nombre
  search: async (query: string): Promise<Medicament[]> => {
    const response = await apiClient.get<Medicament[]>('/medicaments/search', {
      params: { q: query },
    });
    return response.data;
  },
};

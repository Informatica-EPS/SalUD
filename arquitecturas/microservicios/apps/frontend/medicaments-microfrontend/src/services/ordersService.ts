import axios from 'axios';
import { OrdenesResponse } from '../types/medicament.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export const ordersService = {
  // Obtener ordenes del paciente por medicamento
  getByPatientDocument: async (id: number): Promise<OrdenesResponse> => {
      const response = await apiClient.get<OrdenesResponse>(`/orders/getByPatientDocument/${id}`);
      return response.data;
    },
};

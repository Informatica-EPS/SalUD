import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Obtener la URL base de la API desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
   baseURL: API_URL,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('token');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
   (response) => response,
   (error: AxiosError) => {
      if (error.response?.status === 401) {
         // Token expirado o inválido
         localStorage.removeItem('token');
         localStorage.removeItem('isAuthenticated');
         localStorage.removeItem('user');
         window.location.href = '/login';
      }
      return Promise.reject(error);
   }
);

export default apiClient;

// Funciones helper para hacer requests
export const api = {
   // GET request
   get: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
      const response = await apiClient.get<T>(endpoint, config);
      return response.data;
   },

   // POST request
   post: async <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
      const response = await apiClient.post<T>(endpoint, data, config);
      return response.data;
   },

   // PUT request
   put: async <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
      const response = await apiClient.put<T>(endpoint, data, config);
      return response.data;
   },

   // DELETE request
   delete: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
      const response = await apiClient.delete<T>(endpoint, config);
      return response.data;
   },

   // PATCH request
   patch: async <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
      const response = await apiClient.patch<T>(endpoint, data, config);
      return response.data;
   },
};

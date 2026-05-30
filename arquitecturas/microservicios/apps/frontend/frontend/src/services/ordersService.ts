import { api } from './apiClient';
import {
   IOrder,
   ICreateOrderRequest,
   IUpdateOrderRequest,
   IOrdersResponse,
   IApiResponse,
} from '../interface/IBackend';

export const ordersService = {
   // Obtener todas las órdenes con paginación
   getOrders: async (page: number = 1, limit: number = 10): Promise<IOrdersResponse> => {
      return await api.get<IOrdersResponse>(`/orders?page=${page}&limit=${limit}`);
   },

   // Obtener órdenes por cita
   getOrdersByAppointment: async (idCita: number): Promise<IOrdersResponse> => {
      return await api.get<IOrdersResponse>(`/orders?idCita=${idCita}`);
   },

   // Obtener orden por ID
   getOrderById: async (id: number): Promise<IOrder> => {
      return await api.get<IOrder>(`/orders/${id}`);
   },

   // Crear nueva orden
   createOrder: async (data: ICreateOrderRequest): Promise<IApiResponse<IOrder>> => {
      return await api.post<IApiResponse<IOrder>>('/orders', data);
   },

   // Actualizar orden existente
   updateOrder: async (id: number, data: IUpdateOrderRequest): Promise<IApiResponse<IOrder>> => {
      return await api.put<IApiResponse<IOrder>>(`/orders/${id}`, data);
   },

   // Eliminar orden
   deleteOrder: async (id: number): Promise<IApiResponse<void>> => {
      return await api.delete<IApiResponse<void>>(`/orders/${id}`);
   },

   // Obtener órdenes disponibles
   getAvailableOrders: async (): Promise<IApiResponse<IOrder[]>> => {
      return await api.get<IApiResponse<IOrder[]>>('/orders/available');
   },

   // Obtener órdenes programadas
   getScheduledOrders: async (): Promise<IApiResponse<IOrder[]>> => {
      return await api.get<IApiResponse<IOrder[]>>('/orders/scheduled');
   },

   // Obtener órdenes ejecutadas
   getExecutedOrders: async (): Promise<IApiResponse<IOrder[]>> => {
      return await api.get<IApiResponse<IOrder[]>>('/orders/executed');
   },
};

export default ordersService;

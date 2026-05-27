import { useState, useCallback } from 'react';
import { ordersService } from '../services/ordersService';
import {
   IOrder,
   ICreateOrderRequest,
   IUpdateOrderRequest,
} from '../interface/IBackend';

export const useOrders = () => {
   const [orders, setOrders] = useState<IOrder[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchOrders = useCallback(async (page: number = 1, limit: number = 10) => {
      setLoading(true);
      setError(null);
      try {
         const response = await ordersService.getOrders(page, limit);
         setOrders(response.ordenes);
         return { success: true, data: response };
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Error al cargar órdenes';
         setError(errorMessage);
         return { success: false, error: errorMessage };
      } finally {
         setLoading(false);
      }
   }, []);

   const fetchOrdersByAppointment = useCallback(async (idCita: number) => {
      setLoading(true);
      setError(null);
      try {
         const response = await ordersService.getOrdersByAppointment(idCita);
         setOrders(response.ordenes);
         return { success: true, data: response };
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Error al cargar órdenes';
         setError(errorMessage);
         return { success: false, error: errorMessage };
      } finally {
         setLoading(false);
      }
   }, []);

   const createOrder = useCallback(async (data: ICreateOrderRequest) => {
      setLoading(true);
      setError(null);
      try {
         const response = await ordersService.createOrder(data);
         if (response.success && response.data) {
            setOrders((prevOrders) => [...prevOrders, response.data]);
         }
         return { success: response.success, data: response.data, message: response.message };
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Error al crear orden';
         setError(errorMessage);
         return { success: false, error: errorMessage };
      } finally {
         setLoading(false);
      }
   }, []);

   const updateOrder = useCallback(async (id: number, data: IUpdateOrderRequest) => {
      setLoading(true);
      setError(null);
      try {
         const response = await ordersService.updateOrder(id, data);
         if (response.success && response.data) {
            setOrders((prevOrders) =>
               prevOrders.map((order) => (order.id === id ? response.data : order))
            );
         }
         return { success: response.success, data: response.data, message: response.message };
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Error al actualizar orden';
         setError(errorMessage);
         return { success: false, error: errorMessage };
      } finally {
         setLoading(false);
      }
   }, []);

   const deleteOrder = useCallback(async (id: number) => {
      setLoading(true);
      setError(null);
      try {
         const response = await ordersService.deleteOrder(id);
         if (response.success) {
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
         }
         return { success: response.success, message: response.message };
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Error al eliminar orden';
         setError(errorMessage);
         return { success: false, error: errorMessage };
      } finally {
         setLoading(false);
      }
   }, []);

   return {
      orders,
      loading,
      error,
      fetchOrders,
      fetchOrdersByAppointment,
      createOrder,
      updateOrder,
      deleteOrder,
   };
};

export default useOrders;

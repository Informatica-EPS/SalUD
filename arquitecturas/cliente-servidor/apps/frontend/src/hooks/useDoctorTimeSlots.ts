import { useState, useEffect } from 'react';
import { timeSlotsService } from '../services';
import { ITimeSlot } from '../interface';

/**
 * Hook personalizado para manejar horarios disponibles de un doctor
 * @param doctorId - ID del doctor
 */
export const useDoctorTimeSlots = (doctorId: number | null) => {
   const [availableSlots, setAvailableSlots] = useState<ITimeSlot[]>([]);
   const [allSlots, setAllSlots] = useState<ITimeSlot[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchAvailableSlots = async () => {
      if (!doctorId) return;

      try {
         setLoading(true);
         setError(null);
         const slots = await timeSlotsService.getAvailableByDoctor(doctorId);
         setAvailableSlots(slots);
      } catch (err) {
         setError('Error al cargar horarios disponibles');
         console.error('Error en useDoctorTimeSlots:', err);
      } finally {
         setLoading(false);
      }
   };

   const fetchAllSlots = async (limit: number = 50) => {
      if (!doctorId) return;

      try {
         setLoading(true);
         setError(null);
         const slots = await timeSlotsService.getByDoctor(doctorId, limit);
         setAllSlots(slots);
      } catch (err) {
         setError('Error al cargar horarios');
         console.error('Error en useDoctorTimeSlots:', err);
      } finally {
         setLoading(false);
      }
   };

   const createTimeSlot = async (
      fecha: string,
      horaInicio: string,
      horaFin: string
   ) => {
      if (!doctorId) return { success: false, error: 'No hay doctor seleccionado' };

      try {
         await timeSlotsService.create({
            fecha,
            horaInicio,
            horaFin,
            estado: 'disponible',
            idDoctor: doctorId,
            creadoPor: doctorId,
            actualizadoPor: doctorId,
         });

         // Refrescar horarios
         await fetchAvailableSlots();
         return { success: true };
      } catch (err) {
         console.error('Error al crear horario:', err);
         return { success: false, error: err };
      }
   };

   const deleteTimeSlot = async (slotId: number) => {
      try {
         await timeSlotsService.delete(slotId);
         // Refrescar horarios
         await fetchAvailableSlots();
         return { success: true };
      } catch (err) {
         console.error('Error al eliminar horario:', err);
         return { success: false, error: err };
      }
   };

   useEffect(() => {
      if (doctorId) {
         fetchAvailableSlots();
      }
   }, [doctorId]);

   return {
      availableSlots,
      allSlots,
      loading,
      error,
      refetchAvailable: fetchAvailableSlots,
      refetchAll: fetchAllSlots,
      createTimeSlot,
      deleteTimeSlot,
   };
};

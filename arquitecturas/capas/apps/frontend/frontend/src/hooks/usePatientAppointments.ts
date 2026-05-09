import { useState, useEffect } from 'react';
import { appointmentsService } from '../services';
import { IAppointment } from '../interface';

/**
 * Hook personalizado para manejar citas de un paciente
 * @param pacienteId - ID del paciente
 * @param page - Página actual (default: 1)
 * @param limit - Límite de resultados por página (default: 10)
 */
export const usePatientAppointments = (
   pacienteId: number,
   page: number = 1,
   limit: number = 10
) => {
   const [appointments, setAppointments] = useState<IAppointment[]>([]);
   const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchAppointments = async () => {
      try {
         setLoading(true);
         setError(null);
         
         const response: any = await appointmentsService.getByPatient(pacienteId, page, limit);
         
         console.log('Response from backend:', response);
         
         // Manejar diferentes estructuras de respuesta del backend
         if (response.citas) {
            // Estructura: { citas: [], totalPages, currentPage, totalItems }
            setAppointments(response.citas || []);
            setPagination({
               page: response.currentPage || page,
               limit: limit,
               total: response.totalItems || 0,
               totalPages: response.totalPages || 0,
            });
         } else if (response.data) {
            // Estructura: { data: [], pagination: {...} }
            setAppointments(response.data || []);
            setPagination(response.pagination || {
               page: 1,
               limit: 10,
               total: 0,
               totalPages: 0,
            });
         } else if (Array.isArray(response)) {
            // Estructura: array directo
            setAppointments(response);
            setPagination({
               page: 1,
               limit: response.length,
               total: response.length,
               totalPages: 1,
            });
         } else {
            // Si no hay estructura reconocida, inicializar vacío
            setAppointments([]);
            setPagination({
               page: 1,
               limit: 10,
               total: 0,
               totalPages: 0,
            });
         }
      } catch (err) {
         setError('Error al cargar las citas');
         console.error('Error en usePatientAppointments:', err);
         // Inicializar con valores vacíos en caso de error
         setAppointments([]);
      } finally {
         setLoading(false);
      }
   };

   const cancelAppointment = async (appointmentId: number) => {
      try {
         await appointmentsService.cancel(appointmentId, {
            estado: 'cancelada',
            actualizadoPor: pacienteId,
         });
         // Refrescar las citas
         await fetchAppointments();
         return { success: true };
      } catch (err) {
         console.error('Error al cancelar cita:', err);
         return { success: false, error: err };
      }
   };

   const rescheduleAppointment = async (
      appointmentId: number,
      newTimeSlotId: number
   ) => {
      try {
         const appointment = appointments.find(a => a.id === appointmentId);
         if (!appointment) {
            throw new Error('Cita no encontrada');
         }

         await appointmentsService.reschedule(appointmentId, {
            tipoCita: appointment.tipoCita,
            estado: 'programada',
            idPaciente: appointment.idPaciente,
            idDoctor: appointment.idDoctor,
            idHorario: newTimeSlotId,
            creadoPor: appointment.creadoPor,
            actualizadoPor: pacienteId,
         });

         // Refrescar las citas
         await fetchAppointments();
         return { success: true };
      } catch (err) {
         console.error('Error al reprogramar cita:', err);
         return { success: false, error: err };
      }
   };

   useEffect(() => {
      if (pacienteId) {
         fetchAppointments();
      }
   }, [pacienteId, page, limit]);

   return {
      appointments,
      pagination,
      loading,
      error,
      refetch: fetchAppointments,
      cancelAppointment,
      rescheduleAppointment,
   };
};

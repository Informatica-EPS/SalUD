import { useState } from 'react';
import { appointmentsService, appointmentDetailsService } from '../services';
import { ICreateAppointmentRequest, ICreateAppointmentDetailRequest } from '../interface';

/**
 * Hook personalizado para agendar citas
 */
export const useCreateAppointment = () => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const createAppointment = async (
      appointmentData: ICreateAppointmentRequest,
      detailsData?: Partial<ICreateAppointmentDetailRequest>
   ) => {
      try {
         setLoading(true);
         setError(null);

         // Crear la cita
         const newAppointment = await appointmentsService.create(appointmentData);

         // Si hay detalles, crearlos también
         if (detailsData && detailsData.motivo) {
            await appointmentDetailsService.create({
               ...detailsData,
               motivo: detailsData.motivo,
               idCita: newAppointment.id,
               creadoPor: appointmentData.creadoPor,
               actualizadoPor: appointmentData.actualizadoPor,
            });
         }

         return { success: true, appointment: newAppointment };
      } catch (err) {
         setError('Error al agendar la cita');
         console.error('Error en useCreateAppointment:', err);
         return { success: false, error: err };
      } finally {
         setLoading(false);
      }
   };

   return {
      createAppointment,
      loading,
      error,
   };
};

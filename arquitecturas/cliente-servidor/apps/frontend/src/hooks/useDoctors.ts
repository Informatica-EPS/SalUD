import { useState, useEffect } from 'react';
import { doctorsService } from '../services';
import { IDoctor } from '../interface';

/**
 * Hook personalizado para manejar la lista de doctores
 */
export const useDoctors = () => {
   const [doctors, setDoctors] = useState<IDoctor[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchDoctors = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await doctorsService.getAll();
         setDoctors(data);
      } catch (err) {
         setError('Error al cargar doctores');
         console.error('Error en useDoctors:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDoctors();
   }, []);

   return {
      doctors,
      loading,
      error,
      refetch: fetchDoctors,
   };
};

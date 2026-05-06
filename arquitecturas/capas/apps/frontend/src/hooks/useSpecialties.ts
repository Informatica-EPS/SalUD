import { useState, useEffect } from 'react';
import { specialtiesService } from '../services';
import { ISpecialty } from '../interface';

export const useSpecialties = () => {
   const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      loadSpecialties();
   }, []);

   const loadSpecialties = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await specialtiesService.getAll();
         setSpecialties(data);
      } catch (err) {
         console.error('Error al cargar especialidades:', err);
         setError('Error al cargar las especialidades');
      } finally {
         setLoading(false);
      }
   };

   return {
      specialties,
      loading,
      error,
      refetch: loadSpecialties,
   };
};

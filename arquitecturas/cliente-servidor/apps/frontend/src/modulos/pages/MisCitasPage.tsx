import {
   Box,
   Card,
   CardContent,
   Chip,
   CircularProgress,
   Container,
   Grid,
   Typography,
   Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { citasService } from '../../services';
import { ICitaMedica } from '../../interface';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';

const MisCitasPage = () => {
   const navigate = useNavigate();
   const [citas, setCitas] = useState<ICitaMedica[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      cargarMisCitas();
   }, []);

   const cargarMisCitas = async () => {
      try {
         setLoading(true);
         const data = await citasService.getMisCitas();
         setCitas(data);
      } catch (error) {
         console.error('Error al cargar mis citas:', error);
      } finally {
         setLoading(false);
      }
   };

   const formatearFecha = (fecha: string) => {
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-CO', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      });
   };

   const getEstadoColor = (estado: string) => {
      switch (estado) {
         case 'programada':
            return 'primary';
         case 'completada':
            return 'success';
         case 'cancelada':
            return 'error';
         case 'en_proceso':
            return 'warning';
         default:
            return 'default';
      }
   };

   const getEstadoLabel = (estado: string) => {
      switch (estado) {
         case 'programada':
            return 'Programada';
         case 'completada':
            return 'Completada';
         case 'cancelada':
            return 'Cancelada';
         case 'en_proceso':
            return 'En Proceso';
         default:
            return estado;
      }
   };

   if (loading) {
      return (
         <Container>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
               <CircularProgress />
            </Box>
         </Container>
      );
   }

   return (
      <Container sx={{ py: 4 }}>
         <Box sx={{ mb: 4 }}>
            <Button onClick={() => navigate('/home')} sx={{ mb: 2 }}>
               ← Volver al Inicio
            </Button>
            <Typography variant="h4" gutterBottom>
               Mis Citas Médicas
            </Typography>
            <Typography variant="body1" color="text.secondary">
               Historial y citas programadas
            </Typography>
         </Box>

         {citas.length === 0 ? (
            <Card>
               <CardContent>
                  <Typography align="center" color="text.secondary">
                     No tienes citas médicas registradas
                  </Typography>
               </CardContent>
            </Card>
         ) : (
            <Grid container spacing={3}>
               {citas.map(cita => (
                  <Grid item xs={12} md={6} key={cita.id}>
                     <Card>
                        <CardContent>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Chip
                                 label={getEstadoLabel(cita.estado)}
                                 color={getEstadoColor(cita.estado) as any}
                                 size="small"
                              />
                              <Chip label={cita.medico.especialidad} variant="outlined" size="small" />
                           </Box>

                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon color="action" />
                              <Typography variant="h6">
                                 Dr. {cita.medico.nombre} {cita.medico.apellido}
                              </Typography>
                           </Box>

                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CalendarTodayIcon color="action" fontSize="small" />
                              <Typography variant="body2">{formatearFecha(cita.fecha)}</Typography>
                           </Box>

                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AccessTimeIcon color="action" fontSize="small" />
                              <Typography variant="body2">{cita.hora}</Typography>
                           </Box>

                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PlaceIcon color="action" fontSize="small" />
                              <Typography variant="body2">Consultorio {cita.consultorio}</Typography>
                           </Box>

                           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              <strong>Motivo:</strong> {cita.motivo}
                           </Typography>

                           {cita.estado === 'programada' && (
                              <Button variant="outlined" color="error" fullWidth>
                                 Cancelar Cita
                              </Button>
                           )}
                        </CardContent>
                     </Card>
                  </Grid>
               ))}
            </Grid>
         )}
      </Container>
   );
};

export default MisCitasPage;

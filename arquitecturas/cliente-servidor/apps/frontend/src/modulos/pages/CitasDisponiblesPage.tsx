import {
   Box,
   Button,
   Card,
   CardContent,
   Chip,
   CircularProgress,
   Container,
   FormControl,
   Grid,
   InputLabel,
   MenuItem,
   Select,
   Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { citasService } from '../../services';
import { ICitaDisponible } from '../../interface';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const CitasDisponiblesPage = () => {
   const navigate = useNavigate();
   const [citas, setCitas] = useState<ICitaDisponible[]>([]);
   const [citasFiltradas, setCitasFiltradas] = useState<ICitaDisponible[]>([]);
   const [loading, setLoading] = useState(true);
   const [especialidadFiltro, setEspecialidadFiltro] = useState<string>('todas');
   const [fechaFiltro, setFechaFiltro] = useState<string>('todas');

   useEffect(() => {
      cargarCitas();
   }, []);

   useEffect(() => {
      aplicarFiltros();
   }, [especialidadFiltro, fechaFiltro, citas]);

   const cargarCitas = async () => {
      try {
         setLoading(true);
         const data = await citasService.getCitasDisponibles();
         setCitas(data);
         setCitasFiltradas(data.filter(c => c.disponible));
      } catch (error) {
         console.error('Error al cargar citas:', error);
      } finally {
         setLoading(false);
      }
   };

   const aplicarFiltros = () => {
      let resultado = citas.filter(c => c.disponible);

      if (especialidadFiltro !== 'todas') {
         resultado = resultado.filter(c => c.medico.especialidad === especialidadFiltro);
      }

      if (fechaFiltro !== 'todas') {
         resultado = resultado.filter(c => c.fecha === fechaFiltro);
      }

      setCitasFiltradas(resultado);
   };

   const obtenerEspecialidades = () => {
      const especialidades = new Set(citas.map(c => c.medico.especialidad));
      return Array.from(especialidades);
   };

   const obtenerFechas = () => {
      const fechas = new Set(citas.map(c => c.fecha));
      return Array.from(fechas).sort();
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

   const agruparPorFecha = () => {
      const grupos: { [key: string]: ICitaDisponible[] } = {};
      citasFiltradas.forEach(cita => {
         if (!grupos[cita.fecha]) {
            grupos[cita.fecha] = [];
         }
         grupos[cita.fecha].push(cita);
      });
      return grupos;
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

   const citasAgrupadas = agruparPorFecha();

   return (
      <Container sx={{ py: 4 }}>
         <Box sx={{ mb: 4 }}>
            <Button onClick={() => navigate('/home')} sx={{ mb: 2 }}>
               ← Volver al Inicio
            </Button>
            <Typography variant="h4" gutterBottom>
               Citas Médicas Disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary">
               Selecciona una cita disponible con el médico de tu preferencia
            </Typography>
         </Box>

         {/* Filtros */}
         <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
               <FormControl fullWidth>
                  <InputLabel>Especialidad</InputLabel>
                  <Select
                     value={especialidadFiltro}
                     label="Especialidad"
                     onChange={e => setEspecialidadFiltro(e.target.value)}
                  >
                     <MenuItem value="todas">Todas las especialidades</MenuItem>
                     {obtenerEspecialidades().map(esp => (
                        <MenuItem key={esp} value={esp}>
                           {esp}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
               <FormControl fullWidth>
                  <InputLabel>Fecha</InputLabel>
                  <Select
                     value={fechaFiltro}
                     label="Fecha"
                     onChange={e => setFechaFiltro(e.target.value)}
                  >
                     <MenuItem value="todas">Todas las fechas</MenuItem>
                     {obtenerFechas().map(fecha => (
                        <MenuItem key={fecha} value={fecha}>
                           {formatearFecha(fecha)}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Grid>
         </Grid>

         {/* Resultados */}
         <Typography variant="h6" sx={{ mb: 2 }}>
            {citasFiltradas.length} citas disponibles
         </Typography>

         {Object.keys(citasAgrupadas).length === 0 ? (
            <Card>
               <CardContent>
                  <Typography align="center" color="text.secondary">
                     No hay citas disponibles con los filtros seleccionados
                  </Typography>
               </CardContent>
            </Card>
         ) : (
            Object.entries(citasAgrupadas).map(([fecha, citasDelDia]) => (
               <Box key={fecha} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CalendarTodayIcon />
                     {formatearFecha(fecha)}
                  </Typography>
                  <Grid container spacing={2}>
                     {citasDelDia.map(cita => (
                        <Grid item xs={12} md={6} lg={4} key={cita.id}>
                           <Card sx={{ height: '100%' }}>
                              <CardContent>
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Chip
                                       icon={<LocalHospitalIcon />}
                                       label={cita.medico.especialidad}
                                       color="primary"
                                       size="small"
                                    />
                                    <Chip label="Disponible" color="success" size="small" />
                                 </Box>

                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <PersonIcon color="action" />
                                    <Typography variant="body1" fontWeight="bold">
                                       Dr. {cita.medico.nombre} {cita.medico.apellido}
                                    </Typography>
                                 </Box>

                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AccessTimeIcon color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       {cita.horaInicio} - {cita.horaFin}
                                    </Typography>
                                 </Box>

                                 <Button variant="contained" fullWidth>
                                    Agendar Cita
                                 </Button>
                              </CardContent>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            ))
         )}
      </Container>
   );
};

export default CitasDisponiblesPage;

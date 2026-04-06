import { useState } from 'react';
import {
   Box,
   Button,
   Card,
   CardContent,
   CircularProgress,
   Container,
   Grid,
   Typography,
   Avatar,
   Chip,
   TextField,
   InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useDoctors } from '../../hooks';
import { IDoctor } from '../../interface';

const DoctoresPage: React.FC = () => {
   const { doctors, loading, error, refetch } = useDoctors();
   const [busqueda, setBusqueda] = useState('');

   // Filtrar doctores por nombre
   const doctoresFiltrados = doctors.filter(doctor => {
      const usuario = doctor.User || doctor.usuario;
      const nombreCompleto =
         `${usuario?.primer_nombre || usuario?.primerNombre || ''} ${usuario?.primer_apellido || usuario?.primerApellido || ''}`.toLowerCase();
      return nombreCompleto.includes(busqueda.toLowerCase());
   });

   const handleVerHorarios = (_doctor: IDoctor) => {
      // TODO: Navegar a página de horarios o abrir modal
      console.log('Ver horarios del doctor:', _doctor);
   };

   if (loading) {
      return (
         <Container
            sx={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               minHeight: '60vh',
            }}
         >
            <CircularProgress size={60} />
         </Container>
      );
   }

   if (error) {
      return (
         <Container sx={{ mt: 4 }}>
            <Card sx={{ p: 3, bgcolor: 'error.light' }}>
               <Typography color="error" variant="h6">
                  {error}
               </Typography>
               <Button onClick={refetch} variant="contained" sx={{ mt: 2 }}>
                  Reintentar
               </Button>
            </Card>
         </Container>
      );
   }

   return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
         {/* Header */}
         <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
               👨‍⚕️ Nuestros Doctores
            </Typography>
            <Typography variant="body1" color="text.secondary">
               {doctors.length} doctores disponibles para atenderte
            </Typography>
         </Box>

         {/* Barra de búsqueda */}
         <Box sx={{ mb: 3 }}>
            <TextField
               fullWidth
               placeholder="Buscar doctor por nombre..."
               value={busqueda}
               onChange={e => setBusqueda(e.target.value)}
               InputProps={{
                  startAdornment: (
                     <InputAdornment position="start">
                        <SearchIcon />
                     </InputAdornment>
                  ),
               }}
            />
         </Box>

         {/* Estadísticas */}
         <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
               <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                     <Typography variant="h3">{doctors.length}</Typography>
                     <Typography>Doctores Totales</Typography>
                  </CardContent>
               </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
               <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                  <CardContent>
                     <Typography variant="h3">{doctoresFiltrados.length}</Typography>
                     <Typography>Resultados</Typography>
                  </CardContent>
               </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
               <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                  <CardContent>
                     <Typography variant="h3">24/7</Typography>
                     <Typography>Disponibilidad</Typography>
                  </CardContent>
               </Card>
            </Grid>
         </Grid>

         {/* Lista de Doctores */}
         {doctoresFiltrados.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
               <Typography variant="h6" color="text.secondary">
                  No se encontraron doctores
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Intenta con otro término de búsqueda
               </Typography>
            </Card>
         ) : (
            <Grid container spacing={3}>
               {doctoresFiltrados.map(doctor => (
                  <Grid item xs={12} md={6} key={doctor.id}>
                     <Card
                        sx={{
                           height: '100%',
                           display: 'flex',
                           flexDirection: 'column',
                           transition: 'transform 0.2s, box-shadow 0.2s',
                           '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                           },
                        }}
                     >
                        <CardContent sx={{ flexGrow: 1 }}>
                           {/* Header del card con avatar */}
                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar
                                 sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem',
                                    mr: 2,
                                 }}
                              >
                                 {
                                    ((doctor.User || doctor.usuario)?.primer_nombre ||
                                       (doctor.User || doctor.usuario)?.primerNombre)?.[0]
                                 }
                                 {
                                    ((doctor.User || doctor.usuario)?.primer_apellido ||
                                       (doctor.User || doctor.usuario)?.primerApellido)?.[0]
                                 }
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                 <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Dr.{' '}
                                    {(doctor.User || doctor.usuario)?.primer_nombre ||
                                       (doctor.User || doctor.usuario)?.primerNombre}{' '}
                                    {(doctor.User || doctor.usuario)?.primer_apellido ||
                                       (doctor.User || doctor.usuario)?.primerApellido}
                                 </Typography>
                                 <Chip
                                    label="Disponible"
                                    color="success"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                 />
                              </Box>
                           </Box>

                           {/* Información del doctor */}
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <BadgeIcon fontSize="small" color="action" />
                                 <Typography variant="body2" color="text.secondary">
                                    <strong>Licencia:</strong> {doctor.licenciaMedica}
                                 </Typography>
                              </Box>

                              {((doctor.User || doctor.usuario)?.email ||
                                 (doctor.User || doctor.usuario)?.correo) && (
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       {(doctor.User || doctor.usuario)?.email ||
                                          (doctor.User || doctor.usuario)?.correo}
                                    </Typography>
                                 </Box>
                              )}

                              {(doctor.User || doctor.usuario)?.telefono && (
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       {(doctor.User || doctor.usuario)?.telefono}
                                    </Typography>
                                 </Box>
                              )}

                              {((doctor.User || doctor.usuario)?.documento ||
                                 (doctor.User || doctor.usuario)?.numeroIdentificacion) && (
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       <strong>ID:</strong>{' '}
                                       {(doctor.User || doctor.usuario)?.documento ||
                                          (doctor.User || doctor.usuario)?.numeroIdentificacion}
                                    </Typography>
                                 </Box>
                              )}
                           </Box>
                        </CardContent>

                        {/* Botones de acción */}
                        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                           <Button
                              variant="contained"
                              fullWidth
                              startIcon={<CalendarMonthIcon />}
                              onClick={() => handleVerHorarios(doctor)}
                           >
                              Ver Horarios
                           </Button>
                        </Box>
                     </Card>
                  </Grid>
               ))}
            </Grid>
         )}

         {/* Botón de actualizar */}
         <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={refetch} startIcon={<SearchIcon />}>
               Actualizar Lista
            </Button>
         </Box>
      </Container>
   );
};

export default DoctoresPage;

// React is not needed in modern React with JSX transform
import {
   Box,
   Card,
   CardContent,
   Container,
   Grid,
   Typography,
   Avatar,
   CircularProgress,
   Paper,
   Chip,
   Button,
} from '@mui/material';
import {
   LocalHospital as HospitalIcon,
   Email as EmailIcon,
   Phone as PhoneIcon,
   Badge as BadgeIcon,
   EventAvailable as ScheduleIcon,
} from '@mui/icons-material';
import { useDoctors } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components';

export const DoctoresPage = () => {
   const { doctors, loading, error } = useDoctors();
   const navigate = useNavigate();

   if (loading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={60} />
         </Box>
      );
   }

   if (error) {
      return (
         <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light' }}>
               <Typography variant="h6" color="error.dark">
                  {error}
               </Typography>
            </Paper>
         </Container>
      );
   }

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               Nuestros Médicos
            </Typography>
            <Typography variant="body1" color="text.secondary">
               {doctors.length} profesionales de la salud disponibles
            </Typography>
         </Box>

         {/* Grid de Doctores */}
         <Grid container spacing={3}>
            {doctors.map((doctor) => (
               <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                  <Card
                     elevation={3}
                     sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                           transform: 'translateY(-8px)',
                           boxShadow: 6,
                        },
                     }}
                  >
                     <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {/* Avatar */}
                        <Avatar
                           sx={{
                              width: 100,
                              height: 100,
                              margin: '0 auto 16px',
                              bgcolor: 'primary.main',
                              fontSize: '2.5rem',
                           }}
                        >
                           {((doctor.User || doctor.usuario)?.primer_nombre || (doctor.User || doctor.usuario)?.primerNombre)?.charAt(0)}
                           {((doctor.User || doctor.usuario)?.primer_apellido || (doctor.User || doctor.usuario)?.primerApellido)?.charAt(0)}
                        </Avatar>

                        {/* Nombre */}
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                           Dr. {(doctor.User || doctor.usuario)?.primer_nombre || (doctor.User || doctor.usuario)?.primerNombre} {(doctor.User || doctor.usuario)?.primer_apellido || (doctor.User || doctor.usuario)?.primerApellido}
                        </Typography>

                        {/* Especialidad - Simulada */}
                        <Chip
                           icon={<HospitalIcon />}
                           label="Medicina General"
                           color="primary"
                           variant="outlined"
                           sx={{ mb: 2 }}
                        />

                        {/* Información */}
                        <Box sx={{ textAlign: 'left', mt: 2 }}>
                           <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <BadgeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                 Licencia: {doctor.licenciaMedica}
                              </Typography>
                           </Box>
                           <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                                 sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                 }}
                              >
                                 {(doctor.User || doctor.usuario)?.email || (doctor.User || doctor.usuario)?.correo}
                              </Typography>
                           </Box>
                           <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                 {(doctor.User || doctor.usuario)?.telefono}
                              </Typography>
                           </Box>
                        </Box>

                        {/* Botones de Acción */}
                        <Box mt={3} display="flex" gap={1}>
                           <Button
                              fullWidth
                              variant="contained"
                              startIcon={<ScheduleIcon />}
                              onClick={() => navigate(`/citas-disponibles?doctor=${doctor.id}`)}
                           >
                              Ver Horarios
                           </Button>
                        </Box>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>

         {/* Empty State */}
         {doctors.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <HospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay médicos disponibles
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Por favor, contacte con el administrador
               </Typography>
            </Paper>
         )}
      </Container>
   );
};

export default DoctoresPage;

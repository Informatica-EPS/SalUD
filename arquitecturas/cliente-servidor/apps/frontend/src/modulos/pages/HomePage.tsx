import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';

const HomePage = () => {
   const navigate = useNavigate();
   const { logout, user } = useAuth();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   return (
      <Box sx={{ flexGrow: 1 }}>
         {/* Header */}
         <Box
            sx={{
               backgroundColor: 'primary.main',
               color: 'white',
               py: 2,
               px: 3,
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
            }}
         >
            <Box>
               <Typography variant="h5" component="h1">
                  SalUD - Cliente-Servidor (Frontend)
               </Typography>
               {user && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                     Bienvenido, {user.name}
                  </Typography>
               )}
            </Box>
            <Button color="inherit" onClick={handleLogout}>
               Cerrar Sesión
            </Button>
         </Box>

         {/* Contenido Principal */}
         <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
               Sistema de Agendamiento de Citas Médicas
            </Typography>
            <Typography variant="body1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
               Gestiona citas entre pacientes y médicos de manera eficiente
            </Typography>

            <Grid container spacing={3}>
               <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                           Agendar Cita
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                           Programa una nueva cita médica con el especialista de tu preferencia
                        </Typography>
                        <Button 
                           variant="contained" 
                           fullWidth
                           onClick={() => navigate('/citas-disponibles')}
                        >
                           Nueva Cita
                        </Button>
                     </CardContent>
                  </Card>
               </Grid>

               <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <LocalHospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                           Citas Disponibles
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                           Consulta todas las citas médicas disponibles por fecha y especialidad
                        </Typography>
                        <Button 
                           variant="contained" 
                           fullWidth
                           onClick={() => navigate('/citas-disponibles')}
                        >
                           Ver Disponibilidad
                        </Button>
                     </CardContent>
                  </Card>
               </Grid>

               <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" component="h2" gutterBottom>
                           Mis Citas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                           Revisa tus citas programadas, historial y próximas consultas
                        </Typography>
                        <Button 
                           variant="contained" 
                           fullWidth
                           onClick={() => navigate('/mis-citas')}
                        >
                           Ver Mis Citas
                        </Button>
                     </CardContent>
                  </Card>
               </Grid>
            </Grid>
         </Container>
      </Box>
   );
};

export default HomePage;

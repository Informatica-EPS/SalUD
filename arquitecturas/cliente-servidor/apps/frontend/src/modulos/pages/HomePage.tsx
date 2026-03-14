import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import DoctorsPageAdmin from '../Admin/DoctorsPage';
import PatientsPageAdmin from '../Admin/PatientsPage';

const HomePage = () => {
   const navigate = useNavigate();
   const { logout, user } = useAuth();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   // Determinar roles del usuario
   // Primero intenta obtener roles del array 'roles', si no existe o está vacío, inferir por idPaciente/idDoctor
   const userRoles = user?.roles || [];

   const isPatient = userRoles.includes('Paciente') || (userRoles.length === 0 && user?.idPaciente);
   const isDoctor =
      userRoles.includes('Medico') ||
      userRoles.includes('Doctor') ||
      (userRoles.length === 0 && user?.idDoctor);
   const isAdmin = userRoles.includes('Admin') || userRoles.includes('Administrador');

   // Opciones para pacientes
   const patientOptions = [
      {
         icon: <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
         title: 'Citas Disponibles',
         description: 'Busca y agenda citas con doctores disponibles',
         path: '/citas-disponibles',
         buttonText: 'Ver Disponibles',
         color: 'primary',
      },
      {
         icon: <PersonIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />,
         title: 'Mis Citas',
         description: 'Revisa, cancela o reprograma tus citas médicas',
         path: '/mis-citas',
         buttonText: 'Ver Mis Citas',
         color: 'success',
      },
      {
         icon: <DescriptionIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />,
         title: 'Historia Clínica',
         description: 'Consulta tu historial médico completo',
         path: '/historia-clinica',
         buttonText: 'Ver Historia',
         color: 'info',
      },
   ];

   // Opciones para doctores
   const doctorOptions = [
      {
         icon: <AccessTimeIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />,
         title: 'Gestión de Horarios',
         description: 'Administra tu disponibilidad y horarios',
         path: '/gestion-horarios',
         buttonText: 'Gestionar',
         color: 'warning',
      },
      {
         icon: <MedicalServicesIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />,
         title: 'Mis Pacientes',
         description: 'Revisa las citas programadas con tus pacientes',
         path: '/medico',
         buttonText: 'Ver Pacientes',
         color: 'secondary',
      },
   ];

   // Opciones comunes
   const commonOptions = [
      {
         icon: <LocalHospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
         title: 'Doctores',
         description: 'Directorio completo de doctores disponibles',
         path: '/doctores',
         buttonText: 'Ver Doctores',
         color: 'primary',
      },
   ];

   const adminOptions = [
      {
         icon: <LocalHospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
         title: 'Gestionar Doctores',
         description: 'Administra el listado de doctores registrados',
         path: '/admin/doctors',
         buttonText: 'Ver Doctores',
         color: 'primary',
      },
      {
         icon: <PersonIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />,
         title: 'Gestionar Pacientes',
         description: 'Administra el listado de pacientes registrados',
         path: '/admin/patients',
         buttonText: 'Ver Pacientes',
         color: 'secondary',
      },
   ];

   return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
         {/* Header */}
         <Box
            sx={{
               backgroundColor: 'primary.main',
               color: 'white',
               py: 3,
               px: 3,
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               boxShadow: 3,
            }}
         >
            <Box>
               <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  🏥 SalUD - Sistema de Citas Médicas
               </Typography>
               {user && (
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                     Bienvenido, {user.primer_nombre || user.name || 'Usuario'}
                     {isPatient && ' - Paciente'}
                     {isDoctor && ' - Doctor'}
                     {isAdmin && ' - Administrador'}
                  </Typography>
               )}
            </Box>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
               Cerrar Sesión
            </Button>
         </Box>

         {/* Contenido Principal */}
         <Container sx={{ mt: 5, mb: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
               <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Panel de Control
               </Typography>
               <Typography variant="h6" color="text.secondary">
                  {isPatient && 'Gestiona tus citas y consulta tu historial médico'}
                  {isDoctor && !isPatient && 'Administra tus horarios y pacientes'}
                  {!isPatient && !isDoctor && 'Bienvenido al sistema de gestión de citas médicas'}
               </Typography>
            </Box>

            {/* Sección de Pacientes - Solo visible para pacientes */}
            {isPatient && (
               <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                     👤 Panel de Paciente
                  </Typography>
                  <Grid container spacing={3}>
                     {patientOptions.map((option, index) => (
                        <Grid item xs={12} md={4} key={index}>
                           <Card
                              sx={{
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 transition: 'transform 0.3s, box-shadow 0.3s',
                                 '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6,
                                 },
                              }}
                           >
                              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                                 {option.icon}
                                 <Typography
                                    variant="h5"
                                    component="h2"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold' }}
                                 >
                                    {option.title}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {option.description}
                                 </Typography>
                                 <Button
                                    variant="contained"
                                    fullWidth
                                    color={option.color as any}
                                    onClick={() => navigate(option.path)}
                                    size="large"
                                 >
                                    {option.buttonText}
                                 </Button>
                              </CardContent>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            )}

            {/* Sección de Doctores - Solo visible para doctores */}
            {isDoctor && (
               <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                     👨‍⚕️ Panel de Doctor
                  </Typography>
                  <Grid container spacing={3}>
                     {doctorOptions.map((option, index) => (
                        <Grid item xs={12} md={6} key={index}>
                           <Card
                              sx={{
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 transition: 'transform 0.3s, box-shadow 0.3s',
                                 '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6,
                                 },
                              }}
                           >
                              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                                 {option.icon}
                                 <Typography
                                    variant="h5"
                                    component="h2"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold' }}
                                 >
                                    {option.title}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {option.description}
                                 </Typography>
                                 <Button
                                    variant="contained"
                                    fullWidth
                                    color={option.color as any}
                                    onClick={() => navigate(option.path)}
                                    size="large"
                                 >
                                    {option.buttonText}
                                 </Button>
                              </CardContent>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            )}

            {/* Sección admin - Visible para administradores */}
            {isAdmin && (
               <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                     ● Panel de Administración
                  </Typography>
                  <Grid container spacing={3}>
                     {adminOptions.map((option, index) => (
                        <Grid item xs={12} md={6} lg={4} key={index}>
                           <Card
                              sx={{
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 transition: 'transform 0.3s, box-shadow 0.3s',
                                 '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6,
                                 },
                              }}
                           >
                              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                                 {option.icon}
                                 <Typography
                                    variant="h5"
                                    component="h2"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold' }}
                                 >
                                    {option.title}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {option.description}
                                 </Typography>
                                 <Button
                                    variant="contained"
                                    fullWidth
                                    color={option.color as any}
                                    onClick={() => navigate(option.path)}
                                    size="large"
                                 >
                                    {option.buttonText}
                                 </Button>
                              </CardContent>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            )}

            {/* Sección Común - Visible para todos */}
            <Box>
               <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  🔍 Recursos Comunes
               </Typography>
               <Grid container spacing={3}>
                  {commonOptions.map((option, index) => (
                     <Grid item xs={12} md={6} lg={4} key={index}>
                        <Card
                           sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                 transform: 'translateY(-8px)',
                                 boxShadow: 6,
                              },
                           }}
                        >
                           <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                              {option.icon}
                              <Typography
                                 variant="h5"
                                 component="h2"
                                 gutterBottom
                                 sx={{ fontWeight: 'bold' }}
                              >
                                 {option.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                 {option.description}
                              </Typography>
                              <Button
                                 variant="contained"
                                 fullWidth
                                 color={option.color as any}
                                 onClick={() => navigate(option.path)}
                                 size="large"
                              >
                                 {option.buttonText}
                              </Button>
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            </Box>

            {/* Mensaje si no tiene roles específicos */}
            {!isPatient && !isDoctor && (
               <Box
                  sx={{ mt: 4, p: 4, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}
               >
                  <Typography variant="h6" gutterBottom>
                     👋 Bienvenido al Sistema
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                     Tu cuenta no tiene roles específicos asignados. Contacta al administrador para
                     obtener acceso completo.
                  </Typography>
               </Box>
            )}

            {/* Footer Info */}
            <Box sx={{ mt: 6, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
               <Typography variant="body2" color="text.secondary" align="center">
                  💡 <strong>Tip:</strong> Todas las páginas están conectadas con el backend real.
                  Asegúrate de que el backend esté corriendo en http://localhost:5000
               </Typography>
            </Box>
         </Container>
      </Box>
   );
};

export default HomePage;

import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';

// ── Tipos ────────────────────────────────────────────────────────────────────

type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

interface MenuOption {
   icon: React.ReactNode;
   title: string;
   description: string;
   path: string;
   buttonText: string;
   color: ButtonColor;
}

interface OptionsSectionProps {
   emoji: string;
   title: string;
   options: MenuOption[];
   md?: number;
   lg?: number;
   sx?: object;
}

// ── Estilos compartidos ──────────────────────────────────────────────────────

const ICON_SX = {
   fontSize: 60,
   mb: 2,
   background: 'rgba(26,163,168,0.1)',
   borderRadius: '50%',
   p: 2,
};

const CARD_SX = {
   height: '100%',
   display: 'flex',
   flexDirection: 'column',
   borderRadius: 4,
   transition: 'all 0.3s ease',
   boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
   '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
   },
};

const SECTION_TITLE_SX = {
   fontWeight: 'bold',
   mb: 3,
   borderLeft: '5px solid #1aa3a8',
   pl: 2,
};

// ── Componente reutilizable de sección ───────────────────────────────────────

const OptionsSection = ({ emoji, title, options, md = 4, lg, sx = {} }: OptionsSectionProps) => {
   const navigate = useNavigate();

   return (
      <Box sx={{ mb: 5, ...sx }}>
         <Typography variant="h5" gutterBottom sx={SECTION_TITLE_SX}>
            {emoji} {title}
         </Typography>
         <Grid container spacing={3}>
            {options.map((option, index) => (
               <Grid item xs={12} md={md} lg={lg} key={index}>
                  <Card sx={CARD_SX}>
                     <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                        {option.icon}
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                           {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                           {option.description}
                        </Typography>
                        <Button
                           variant="contained"
                           fullWidth
                           color={option.color}
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
   );
};

// ── Página principal ─────────────────────────────────────────────────────────

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
   const isAdminMedicamentos = userRoles.includes('AdminMedicamentos');

   // ── Opciones por rol ─────────────────────────────────────────────────────

   const patientOptions: MenuOption[] = [
      {
         icon: <CalendarMonthIcon sx={ICON_SX} />,
         title: 'Citas Disponibles',
         description: 'Busca y agenda citas con doctores disponibles',
         path: '/citas-disponibles',
         buttonText: 'Ver Disponibles',
         color: 'primary',
      },
      {
         icon: <PersonIcon sx={ICON_SX} />,
         title: 'Mis Citas',
         description: 'Revisa, cancela o reprograma tus citas médicas',
         path: '/mis-citas',
         buttonText: 'Ver Mis Citas',
         color: 'success',
      },
      {
         icon: <DescriptionIcon sx={ICON_SX} />,
         title: 'Historia Clínica',
         description: 'Consulta tu historial médico completo',
         path: '/historia-clinica',
         buttonText: 'Ver Historia',
         color: 'info',
      },
   ];

      // Opciones para doctores
   const doctorOptions: MenuOption[] = [
      {
         icon: <AccessTimeIcon sx={ICON_SX} />,
         title: 'Gestión de Horarios',
         description: 'Administra tu disponibilidad y horarios',
         path: '/gestion-horarios',
         buttonText: 'Gestionar',
         color: 'warning',
      },
      {
         icon: <MedicalServicesIcon sx={ICON_SX} />,
         title: 'Mis Pacientes',
         description: 'Revisa las citas programadas con tus pacientes',
         path: '/medico',
         buttonText: 'Ver Pacientes',
         color: 'secondary',
      },
   ];

   // Opciones comunes
   const commonOptions: MenuOption[] = [
      {
         icon: <LocalHospitalIcon sx={ICON_SX} />,
         title: 'Doctores',
         description: 'Directorio completo de doctores disponibles',
         path: '/doctores',
         buttonText: 'Ver Doctores',
         color: 'primary',
      },
   ];

   const adminOptions: MenuOption[] = [
      {
         icon: <LocalHospitalIcon sx={ICON_SX} />,
         title: 'Gestionar Doctores',
         description: 'Administra el listado de doctores registrados',
         path: '/admin/doctors',
         buttonText: 'Ver Doctores',
         color: 'primary',
      },
      {
         icon: <PersonIcon sx={ICON_SX} />,
         title: 'Gestionar Pacientes',
         description: 'Administra el listado de pacientes registrados',
         path: '/admin/patients',
         buttonText: 'Ver Pacientes',
         color: 'secondary',
      },
   ];

   const adminMedicamentosOptions: MenuOption[] = [
      {
         icon: <LocalHospitalIcon sx={ICON_SX} />,
         title: 'Gestionar Medicamentos',
         description: 'Administra la entrega de medicamentos',
         path: '/Medicamentos',
         buttonText: 'Entregar Medicamentos',
         color: 'primary',
      },
   ];

   return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
         {/* Header */}
         <Box
            sx={{
               background: 'linear-gradient(135deg, #0e8f9a, #1aa3a8)',
               color: 'white',
               py: 3,
               px: 3,
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
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
                     {isAdminMedicamentos && ' - Administrador de Medicamentos'}
                  </Typography>
               )}
            </Box>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>
               Cerrar Sesión
            </Button>
         </Box>

         {/* Contenido Principal */}
         <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
               <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Panel de Control
               </Typography>
               <Typography variant="h6" color="text.secondary">
                  {isPatient && 'Gestiona tus citas y consulta tu historial médico'}
                  {isDoctor && !isPatient && 'Administra tus horarios y pacientes'}
                  {isAdminMedicamentos && !isPatient && !isDoctor && 'Bienvenido al sistema de entrega de medicamentos'}
                  {!isPatient && !isDoctor && !isAdminMedicamentos && 'Bienvenido al sistema de gestión de citas médicas'}
               </Typography>
            </Box>

            {isPatient && (
               <OptionsSection emoji="👤" title="Panel de Paciente" options={patientOptions} md={4} />
            )}

            {isDoctor && (
               <OptionsSection emoji="👨‍⚕️" title="Panel de Doctor" options={doctorOptions} md={6} />
            )}

            {isAdmin && (
               <OptionsSection emoji="●" title="Panel de Administración" options={adminOptions} md={6} lg={4} sx={{ mt: 4 }} />
            )}

            {!isAdminMedicamentos && (
               <OptionsSection emoji="🔍" title="Recursos Comunes" options={commonOptions} md={6} lg={4} />
            )}

            {isAdminMedicamentos && (
               <OptionsSection emoji="🔍" title="Entrega de Medicamentos" options={adminMedicamentosOptions} md={6} lg={4} />
            )}

            {/* Mensaje si no tiene roles específicos */}
            {!isPatient && !isDoctor && !isAdminMedicamentos && (
               <Box sx={{ mt: 4, p: 4, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
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
            <Box
               sx={{
                  mt: 6,
                  p: 3,
                  borderRadius: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e3f2fd, #ffffff)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
               }}
            >
               <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  SalUD 🩺
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Plataforma para la gestión eficiente de citas médicas y seguimiento clínico
               </Typography>
               <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  © {new Date().getFullYear()} SalUD. Todos los derechos reservados.
               </Typography>
            </Box>
         </Container>
      </Box>
   );
};

export default HomePage;
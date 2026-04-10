import { useState, useEffect } from 'react';
import {
   Box,
   Container,
   Typography,
   CircularProgress,
   Alert,
   Paper,
   Grid,
   Chip,
   Accordion,
   AccordionSummary,
   AccordionDetails,
   Divider,
   Avatar,
} from '@mui/material';
import {
   ExpandMore as ExpandMoreIcon,
   Person as PersonIcon,
   Phone as PhoneIcon,
   Email as EmailIcon,
   CalendarToday as CalendarIcon,
   LocalHospital as HospitalIcon,
   Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { appointmentsService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { getPatientUser, getUserFullName, getUserInitials, getDoctorFullName } from '../../utils';
import { BackButton } from '../../components';

export const HistoriaClinicaPage = () => {
   const { user } = useAuth();
   const pacienteId = user?.idPaciente || null;

   const [historia, setHistoria] = useState<any | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (pacienteId) {
         loadHistoriaClinica();
      } else {
         setLoading(false);
         setError('No se encontró información del paciente en la sesión');
      }
   }, [pacienteId]);

   const loadHistoriaClinica = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await appointmentsService.getMedicalRecords(pacienteId!);
         console.log('Historia clínica recibida:', data);
         setHistoria(data);
      } catch (err) {
         setError('Error al cargar la historia clínica');
         console.error('Error:', err);
      } finally {
         setLoading(false);
      }
   };

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
            <Alert severity="error">{error}</Alert>
         </Container>
      );
   }

   if (!historia) {
      return (
         <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="info">No se encontró información</Alert>
         </Container>
      );
   }

   // Obtener datos del paciente (puede venir como paciente o datosPaciente)
   const datosPaciente = historia.paciente || historia.datosPaciente || {};
   const citas = historia.citas || [];

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'programada':
            return 'primary';
         case 'completada':
         case 'completado':
            return 'success';
         case 'cancelada':
         case 'cancelado':
            return 'error';
         case 'en_proceso':
            return 'warning';
         default:
            return 'default';
      }
   };

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Typography variant="h4" gutterBottom fontWeight="bold">
            Historia Clínica
         </Typography>
         <Typography variant="body1" color="text.secondary" mb={4}>
            Registro completo de atención médica
         </Typography>

         {/* Información del Paciente */}
         <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" mb={3}>
               Información del Paciente
            </Typography>
            <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                  <Box display="flex" gap={2}>
                     <Avatar
                        sx={{
                           width: 80,
                           height: 80,
                           bgcolor: 'primary.main',
                           fontSize: '2rem',
                        }}
                     >
                        {datosPaciente.nombreCompleto 
                           ? datosPaciente.nombreCompleto.split(' ').map((n: string) => n.charAt(0)).slice(0, 2).join('')
                           : getUserInitials(getPatientUser(datosPaciente))}
                     </Avatar>
                     <Box>
                        <Typography variant="h6" gutterBottom>
                           {datosPaciente.nombreCompleto || 
                            getUserFullName(getPatientUser(datosPaciente)) || 'Sin nombre'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                           <PersonIcon fontSize="small" color="action" />
                           <Typography variant="body2" color="text.secondary">
                              ID: {getPatientUser(datosPaciente)?.numeroIdentificacion || 
                                   getPatientUser(datosPaciente)?.documento || 
                                   datosPaciente.documento || 'N/A'} 
                              {getPatientUser(datosPaciente)?.tipoIdentificacion && 
                                ` (${getPatientUser(datosPaciente)?.tipoIdentificacion})`}
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                           <EmailIcon fontSize="small" color="action" />
                           <Typography variant="body2" color="text.secondary">
                              {datosPaciente.email || 
                               getPatientUser(datosPaciente)?.correo || 
                               getPatientUser(datosPaciente)?.email || 'N/A'}
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                           <PhoneIcon fontSize="small" color="action" />
                           <Typography variant="body2" color="text.secondary">
                              {datosPaciente.telefono || 
                               getPatientUser(datosPaciente)?.telefono || 'N/A'}
                           </Typography>
                        </Box>
                     </Box>
                  </Box>
               </Grid>
               <Grid item xs={12} md={6}>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Información Adicional
                     </Typography>
                     <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                        <Chip label={`Ocupación: ${datosPaciente?.ocupacion || 'N/A'}`} size="small" />
                        <Chip
                           label={`Sexo: ${datosPaciente?.sexo || 'N/A'}`}
                           size="small"
                        />
                     </Box>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Religión:</strong> {datosPaciente?.religion || 'N/A'}
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Etnicidad:</strong> {datosPaciente?.etnicidad || datosPaciente?.etnia || 'N/A'}
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Identidad de Género:</strong> {datosPaciente?.identidadGenero || 'N/A'}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        <strong>Discapacidad:</strong> {datosPaciente?.discapacidad || 'N/A'}
                     </Typography>
                     {datosPaciente?.direccion && (
                        <Typography variant="body2" color="text.secondary">
                           <strong>Dirección:</strong> {datosPaciente.direccion}
                        </Typography>
                     )}
                  </Box>
               </Grid>
            </Grid>
         </Paper>

         {/* Resumen */}
         <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
               Resumen de Atenciones
            </Typography>
            <Grid container spacing={2}>
               <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                     <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {citas.length}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Total Citas
                     </Typography>
                  </Paper>
               </Grid>
               <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                     <Typography variant="h4" color="success.main" fontWeight="bold">
                        {citas.filter((c: any) => c.estado === 'completada' || c.estado === 'completado').length}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Completadas
                     </Typography>
                  </Paper>
               </Grid>
               <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                     <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {citas.filter((c: any) => c.estado === 'programada').length}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Programadas
                     </Typography>
                  </Paper>
               </Grid>
               <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                     <Typography variant="h4" color="error.main" fontWeight="bold">
                        {citas.filter((c: any) => c.estado === 'cancelada' || c.estado === 'cancelado').length}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Canceladas
                     </Typography>
                  </Paper>
               </Grid>
            </Grid>
         </Paper>

         {/* Historial de Citas */}
         <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
            Historial de Atenciones ({citas.length})
         </Typography>

         {citas.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary">
                  No hay registros de atención
               </Typography>
            </Paper>
         ) : (
            citas
               .sort((a: any, b: any) => {
                  // Ordenar por ID descendente (más reciente primero)
                  return b.id - a.id;
               })
               .map((cita: any, index: number) => {
                  // Obtener nombre del doctor (puede venir como objeto plano o anidado)
                  const doctorNombre = cita.doctor?.doctorNombreCompleto || 
                                      getDoctorFullName(cita.doctor) || 
                                      getDoctorFullName(cita.Doctor) || 
                                      'Doctor no asignado';
                  
                  return (
                     <Accordion key={cita.id} defaultExpanded={index === 0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Box display="flex" alignItems="center" gap={2} width="100%">
                              <Chip
                                 label={`#${cita.id}`}
                                 size="small"
                                 color="primary"
                                 variant="outlined"
                              />
                              <Box flex={1}>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                    {cita.horario?.fecha &&
                                       new Date(cita.horario.fecha + 'T00:00:00').toLocaleDateString(
                                          'es-ES',
                                          {
                                             year: 'numeric',
                                             month: 'long',
                                             day: 'numeric',
                                          }
                                       )}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    {doctorNombre}
                                 </Typography>
                              </Box>
                              <Chip
                                 label={cita.estado}
                                 color={getStatusColor(cita.estado)}
                                 size="small"
                              />
                           </Box>
                        </AccordionSummary>
                     <AccordionDetails>
                        <Box>
                           {/* Información Básica */}
                           <Grid container spacing={2} mb={2}>
                              <Grid item xs={12} sm={6}>
                                 <Box display="flex" alignItems="center" gap={1}>
                                    <CalendarIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                       <strong>Fecha:</strong>{' '}
                                       {cita.horario?.fecha &&
                                          new Date(
                                             cita.horario.fecha + 'T00:00:00'
                                          ).toLocaleDateString('es-ES')}
                                    </Typography>
                                 </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <Box display="flex" alignItems="center" gap={1}>
                                    <HospitalIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                       <strong>Tipo:</strong> {cita.tipoCita}
                                    </Typography>
                                 </Box>
                              </Grid>
                           </Grid>

                           {cita.detalles && (
                              <>
                                 <Divider sx={{ my: 2 }} />

                                 {/* Motivo */}
                                 {cita.detalles.motivo && (
                                    <Box mb={2}>
                                       <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          gutterBottom
                                       >
                                          Motivo de Consulta
                                       </Typography>
                                       <Typography variant="body2">
                                          {cita.detalles.motivo}
                                       </Typography>
                                    </Box>
                                 )}

                                 {/* Anamnesis */}
                                 {cita.detalles.anamnesis && (
                                    <Box mb={2}>
                                       <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          gutterBottom
                                       >
                                          Anamnesis
                                       </Typography>
                                       <Typography variant="body2">
                                          {cita.detalles.anamnesis}
                                       </Typography>
                                    </Box>
                                 )}

                                 {/* Examen Físico */}
                                 {cita.detalles.examenFisico && (
                                    <Box mb={2}>
                                       <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          gutterBottom
                                       >
                                          Examen Físico
                                       </Typography>
                                       <Typography variant="body2">
                                          {cita.detalles.examenFisico}
                                       </Typography>
                                    </Box>
                                 )}

                                 {/* Diagnóstico */}
                                 {cita.detalles.diagnostico && (
                                    <Box mb={2}>
                                       <Paper
                                          variant="outlined"
                                          sx={{ p: 2, bgcolor: 'warning.light' }}
                                       >
                                          <Typography
                                             variant="subtitle2"
                                             fontWeight="bold"
                                             gutterBottom
                                          >
                                             Diagnóstico
                                          </Typography>
                                          <Typography variant="body2">
                                             {cita.detalles.diagnostico}
                                          </Typography>
                                       </Paper>
                                    </Box>
                                 )}

                                 {/* Plan de Manejo */}
                                 {cita.detalles.planManejo && (
                                    <Box mb={2}>
                                       <Paper
                                          variant="outlined"
                                          sx={{ p: 2, bgcolor: 'success.light' }}
                                       >
                                          <Typography
                                             variant="subtitle2"
                                             fontWeight="bold"
                                             gutterBottom
                                          >
                                             Plan de Manejo
                                          </Typography>
                                          <Typography variant="body2">
                                             {cita.detalles.planManejo}
                                          </Typography>
                                       </Paper>
                                    </Box>
                                 )}

                                 {/* Antecedentes */}
                                 {cita.detalles.antecedentes && (
                                    <Box mb={2}>
                                       <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          gutterBottom
                                       >
                                          Antecedentes
                                       </Typography>
                                       <Typography variant="body2">
                                          {cita.detalles.antecedentes}
                                       </Typography>
                                    </Box>
                                 )}

                                 {/* Evolución */}
                                 {cita.detalles.evolucion && (
                                    <Box>
                                       <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          gutterBottom
                                       >
                                          Evolución
                                       </Typography>
                                       <Typography variant="body2">
                                          {cita.detalles.evolucion}
                                       </Typography>
                                    </Box>
                                 )}
                              </>
                           )}
                        </Box>
                     </AccordionDetails>
                  </Accordion>
                  );
               })
         )}
      </Container>
   );
};

export default HistoriaClinicaPage;

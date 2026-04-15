import { useState } from 'react';
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   Grid,
   Typography,
   CircularProgress,
   Chip,
   Alert,
   Paper,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Divider,
} from '@mui/material';
import {
   CalendarToday as CalendarIcon,
   AccessTime as TimeIcon,
   Person as PersonIcon,
   Cancel as CancelIcon,
   Description as DescriptionIcon,
   LocalHospital as HospitalIcon,
   AssignmentTurnedIn as OrderIcon,
} from '@mui/icons-material';
import { usePatientAppointments } from '../../hooks';
import { getDoctorFullName, getDoctor, getTimeSlot, getAppointmentDetail } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components';

export const MisCitasPage = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const pacienteId = user?.idPaciente || 1; // Fallback temporal a 1 para desarrollo
   const {
      appointments,
      loading,
      error,
      cancelAppointment,
   } = usePatientAppointments(pacienteId, 1, 20);

   const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
   const [openCancelDialog, setOpenCancelDialog] = useState(false);
   const [success, setSuccess] = useState<string | null>(null);

   const handleOpenCancelDialog = (appointmentId: number) => {
      setSelectedAppointment(appointmentId);
      setOpenCancelDialog(true);
   };

   const handleCloseCancelDialog = () => {
      setOpenCancelDialog(false);
      setSelectedAppointment(null);
   };

   const handleCancelar = async () => {
      if (!selectedAppointment) return;

      const result = await cancelAppointment(selectedAppointment);
      if (result.success) {
         setSuccess('Cita cancelada exitosamente');
         handleCloseCancelDialog();
         setTimeout(() => setSuccess(null), 3000);
      } else {
         setSuccess('Error al cancelar la cita');
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'programada':
            return 'primary';
         case 'completado':
         case 'completada':
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

   const getStatusLabel = (status: string) => {
      switch (status) {
         case 'programada':
            return 'Programada';
         case 'completado':
         case 'completada':
            return 'Completada';
         case 'cancelada':
         case 'cancelado':
            return 'Cancelada';
         case 'en_proceso':
            return 'En Proceso';
         default:
            return status;
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

   // Separar citas por estado (con validación)
   const citasProgramadas = (appointments || []).filter((cita) => cita.estado === 'programada');
   const citasCompletadas = (appointments || []).filter((cita) => cita.estado === 'completado' || cita.estado === 'completada');
   const citasCanceladas = (appointments || []).filter((cita) => cita.estado === 'cancelado' || cita.estado === 'cancelada');

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               Mis Citas Médicas
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
               <Typography variant="body1" color="text.secondary">
                  Gestiona tus citas programadas y revisa tu historial
               </Typography>
               <Button
                  variant="contained"
                  color="primary"
                  startIcon={<OrderIcon />}
                  onClick={() => navigate('/mis-ordenes')}
               >
                  Ver Mis Órdenes
               </Button>
            </Box>
         </Box>

         {/* Success Alert */}
         {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
               {success}
            </Alert>
         )}

         {/* Estadísticas */}
         <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {citasProgramadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Programadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {citasCompletadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Completadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {citasCanceladas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Canceladas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.200' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {(appointments || []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Total
                  </Typography>
               </Paper>
            </Grid>
         </Grid>

         {/* Citas Programadas */}
         {citasProgramadas.length > 0 && (
            <>
               <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                  Próximas Citas
               </Typography>
               <Grid container spacing={3} mb={4}>
                  {citasProgramadas.map((cita) => (
                     <Grid item xs={12} key={cita.id}>
                        <Card elevation={3}>
                           <CardContent>
                              <Grid container spacing={2}>
                                 <Grid item xs={12} md={8}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                       <Chip
                                          label={getStatusLabel(cita.estado)}
                                          color={getStatusColor(cita.estado)}
                                          size="small"
                                       />
                                       <Typography variant="caption" color="text.secondary">
                                          Cita #{cita.id}
                                       </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                       <PersonIcon color="primary" />
                                       <Typography variant="h6">
                                          {getDoctorFullName(getDoctor(cita) || cita.doctor)}
                                       </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                       <HospitalIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {cita.tipoCita}
                                       </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                       <CalendarIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {(() => {
                                             const horario = getTimeSlot(cita);
                                             if (horario?.fecha) {
                                                return new Date(
                                                   horario.fecha + 'T00:00:00'
                                                ).toLocaleDateString('es-ES', {
                                                   weekday: 'long',
                                                   year: 'numeric',
                                                   month: 'long',
                                                   day: 'numeric',
                                                });
                                             }
                                             return 'Fecha no disponible';
                                          })()}
                                       </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                       <TimeIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {(() => {
                                             const horario = getTimeSlot(cita);
                                             return horario?.horaInicio && horario?.horaFin
                                                ? `${horario.horaInicio} - ${horario.horaFin}`
                                                : 'Hora no disponible';
                                          })()}
                                       </Typography>
                                    </Box>

                                    {(() => {
                                       const detalles = getAppointmentDetail(cita);
                                       return detalles?.motivo ? (
                                          <Box display="flex" alignItems="start" gap={1} mt={2}>
                                             <DescriptionIcon fontSize="small" color="action" />
                                             <Typography variant="body2" color="text.secondary">
                                                <strong>Motivo:</strong> {detalles.motivo}
                                             </Typography>
                                          </Box>
                                       ) : null;
                                    })()}
                                 </Grid>

                                 <Grid item xs={12} md={4}>
                                    <Box
                                       display="flex"
                                       flexDirection="column"
                                       gap={1}
                                       height="100%"
                                       justifyContent="center"
                                    >
                                       <Button
                                          variant="outlined"
                                          color="error"
                                          startIcon={<CancelIcon />}
                                          onClick={() => handleOpenCancelDialog(cita.id)}
                                          fullWidth
                                       >
                                          Cancelar Cita
                                       </Button>
                                    </Box>
                                 </Grid>
                              </Grid>
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            </>
         )}

         {/* Historial de Citas */}
         {(citasCompletadas.length > 0 || citasCanceladas.length > 0) && (
            <>
               <Divider sx={{ my: 4 }} />
               <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                  Historial
               </Typography>
               <Grid container spacing={2}>
                  {[...citasCompletadas, ...citasCanceladas]
                     .sort((a, b) => {
                        const horarioA = getTimeSlot(a);
                        const horarioB = getTimeSlot(b);
                        const dateA = new Date(horarioA?.fecha || '').getTime();
                        const dateB = new Date(horarioB?.fecha || '').getTime();
                        return dateB - dateA;
                     })
                     .map((cita) => {
                        const horario = getTimeSlot(cita);
                        const detalles = getAppointmentDetail(cita);
                        return (
                           <Grid item xs={12} md={6} key={cita.id}>
                              <Card variant="outlined">
                                 <CardContent>
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                       <Chip
                                          label={getStatusLabel(cita.estado)}
                                          color={getStatusColor(cita.estado)}
                                          size="small"
                                       />
                                       <Typography variant="caption" color="text.secondary">
                                          #{cita.id}
                                       </Typography>
                                    </Box>

                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                       {getDoctorFullName(getDoctor(cita) || cita.doctor)}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                       {horario?.fecha &&
                                          new Date(
                                             horario.fecha + 'T00:00:00'
                                          ).toLocaleDateString('es-ES')}
                                       {' • '}
                                       {horario?.horaInicio}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                       {cita.tipoCita}
                                    </Typography>

                                    {detalles?.diagnostico && (
                                       <Box mt={2} p={1} bgcolor="grey.100" borderRadius={1}>
                                          <Typography variant="caption" color="text.secondary">
                                             <strong>Diagnóstico:</strong>
                                          </Typography>
                                          <Typography variant="body2">
                                             {detalles.diagnostico}
                                          </Typography>
                                       </Box>
                                    )}
                                 </CardContent>
                              </Card>
                           </Grid>
                        );
                     })}
               </Grid>
            </>
         )}

         {/* Empty State */}
         {(appointments || []).length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tienes citas médicas
               </Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>
                  Agenda tu primera cita con nuestros especialistas
               </Typography>
               <Button variant="contained" href="/citas-disponibles">
                  Ver Horarios Disponibles
               </Button>
            </Paper>
         )}

         {/* Dialog Confirmar Cancelación */}
         <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogContent>
               <Typography>
                  ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede
                  deshacer.
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseCancelDialog}>No, mantener cita</Button>
               <Button onClick={handleCancelar} color="error" variant="contained">
                  Sí, cancelar cita
               </Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default MisCitasPage;
